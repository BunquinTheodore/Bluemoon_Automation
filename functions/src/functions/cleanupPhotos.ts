import * as functions from 'firebase-functions';
import { db } from '../config/firebase-admin';
import { deletePhotosByUrls, DeleteResult } from '../services/cloudinary';

const MAX_BATCH_SIZE = 500; // Firestore batch write limit

/**
 * Scheduled function to clean up photos older than 24 hours
 * Runs daily at 12:00 AM (midnight) Asia/Manila time
 *
 * Process:
 * 1. Query Firestore for taskSubmissions older than 24 hours
 * 2. Delete their photos from Cloudinary
 * 3. Soft delete in Firestore (mark as deleted, clear URLs)
 */
export const cleanupOldPhotos = functions
  .region('asia-southeast1')
  .pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      console.log('Starting photo cleanup for submissions older than', twentyFourHoursAgo.toISOString());

      const oldPhotosSnapshot = await db
        .collection('taskSubmissions')
        .where('timestamp', '<', twentyFourHoursAgo)
        .get();

      const photoUrls: string[] = [];
      const docsToUpdate: FirebaseFirestore.DocumentReference[] = [];

      // Filter in memory: a `deleted != true` query would exclude docs missing the field.
      oldPhotosSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.deleted === true) return;
        const photoUrl = data.photoUrl;
        if (typeof photoUrl === 'string' && photoUrl) {
          photoUrls.push(photoUrl);
          docsToUpdate.push(doc.ref);
        }
      });

      if (docsToUpdate.length === 0) {
        console.log('No old photos found to delete');
        return { success: true, message: 'No photos to delete', deletedCount: 0 };
      }

      console.log(`Found ${docsToUpdate.length} photos to delete`);

      const cloudinaryResult: DeleteResult = await deletePhotosByUrls(photoUrls);
      if (!cloudinaryResult.success) {
        // Continue with the Firestore soft delete even if Cloudinary fails
        console.error('Failed to delete some photos from Cloudinary:', cloudinaryResult.error || 'Unknown error');
      }

      // Soft delete in Firestore; a batch cannot be reused after commit, so chunk them.
      for (let i = 0; i < docsToUpdate.length; i += MAX_BATCH_SIZE) {
        const chunk = docsToUpdate.slice(i, i + MAX_BATCH_SIZE);
        const batch = db.batch();
        for (const docRef of chunk) {
          batch.update(docRef, {
            deleted: true,
            photoUrl: null,
            deletedAt: new Date(),
          });
        }
        await batch.commit();
        console.log(`Committed batch of ${chunk.length} Firestore updates`);
      }

      const result = {
        success: true,
        message: 'Old photos deleted successfully',
        deletedCount: docsToUpdate.length,
        cloudinaryDeletedCount: cloudinaryResult.deletedCount,
        timestamp: new Date().toISOString(),
      };

      console.log('Photo cleanup completed:', result);
      return result;
    } catch (error) {
      console.error('Error in cleanupOldPhotos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup old photos',
        timestamp: new Date().toISOString(),
      };
    }
  });
