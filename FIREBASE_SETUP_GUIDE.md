# Firebase Setup Guide - Step by Step

## Complete Setup Instructions for Bluemoon Business Management App

Follow these steps in order to set up your Firebase backend completely.

---

## Phase 1: Firebase Project Setup (Console)

### Step 1: Create Collections Structure

Go to Firebase Console → Firestore Database → Start Collection

Create these collections with their first documents:

### 1.1 Create `users` Collection
```
Collection ID: users
Document ID: [Auto-ID or use your Firebase Auth UID]

Fields:
- userId: [string] "owner_001"
- email: [string] "owner@bluemoon.com"
- name: [string] "John Doe"
- role: [string] "owner"
- contactNumber: [string] "+63-XXX-XXX-XXXX"
- status: [string] "full-time"
- position: [string] "Business Owner"
- birthday: [string] "1990-01-01"
- joinDate: [timestamp] [Current date]
- branch: [string] "Downtown Branch"
- createdAt: [timestamp] [Current date]
- updatedAt: [timestamp] [Current date]
- isActive: [boolean] true
```

### 1.2 Create `branches` Collection
```
Collection ID: branches
Document ID: branch_001

Fields:
- branchId: [string] "branch_001"
- name: [string] "Downtown Branch"
- address: [string] "123 Main Street, City"
- city: [string] "Metro Manila"
- phone: [string] "+63-XXX-XXX-XXXX"
- email: [string] "downtown@bluemoon.com"
- managerId: [string] ""
- managerName: [string] ""
- isActive: [boolean] true
- openingHours: [map]
  - monday: [map] { open: "08:00", close: "20:00" }
  - tuesday: [map] { open: "08:00", close: "20:00" }
  - wednesday: [map] { open: "08:00", close: "20:00" }
  - thursday: [map] { open: "08:00", close: "20:00" }
  - friday: [map] { open: "08:00", close: "20:00" }
  - saturday: [map] { open: "09:00", close: "21:00" }
  - sunday: [map] { open: "09:00", close: "21:00" }
- createdAt: [timestamp] [Current date]
- updatedAt: [timestamp] [Current date]
```

### 1.3 Create `tasks` Collection (Kitchen Opening Tasks)
```
Collection ID: tasks
Document ID: task_K_O_001

Fields:
- taskId: [string] "task_K_O_001"
- name: [string] "Wear proper gear/uniform"
- qrCodeId: [string] "QR-K-O-001"
- station: [string] "kitchen"
- category: [string] "opening"
- description: [string] "Put on chef coat, hat, and apron"
- branch: [string] "Downtown Branch"
- order: [number] 1
- isActive: [boolean] true
- createdAt: [timestamp] [Current date]
- createdBy: [string] "owner_001"
- updatedAt: [timestamp] [Current date]
```

Repeat for more tasks (see full task list below).

### 1.4 Create `recipes` Collection
```
Collection ID: recipes
Document ID: recipe_001

Fields:
- recipeId: [string] "recipe_001"
- name: [string] "Iced Latte"
- description: [string] "3-step espresso-based cold drink"
- category: [string] "Cold Drinks"
- imageUrl: [string] "https://images.unsplash.com/photo-1684548856346-041e1a90d630"
- imagePath: [string] ""
- videoDuration: [string] "2:30"
- videoUrl: [string] ""
- ingredients: [array]
  - "2 shots of espresso"
  - "8 oz cold milk"
  - "Ice cubes"
  - "Simple syrup (optional)"
- steps: [array]
  - "Fill a tall glass with ice cubes"
  - "Pour 2 shots of freshly brewed espresso over the ice"
  - "Add cold milk slowly to create layers"
  - "Stir gently and add sweetener if desired"
- tools: [array]
  - "Espresso machine"
  - "Tall glass"
  - "Ice scoop"
  - "Stirring spoon"
- difficulty: [string] "easy"
- prepTime: [number] 3
- isActive: [boolean] true
- createdBy: [string] "owner_001"
- createdAt: [timestamp] [Current date]
- updatedAt: [timestamp] [Current date]
```

### 1.5 Create `settings` Collection
```
Collection ID: settings
Document ID: general

Fields:
- inventoryThresholds: [map]
  - lowStockPercentage: [number] 30
  - criticalStockPercentage: [number] 10
- notifications: [map]
  - enableEmail: [boolean] true
  - enablePush: [boolean] true
  - taskOverdueHours: [number] 2
- companyName: [string] "Bluemoon Business"
- companyLogo: [string] ""
- updatedAt: [timestamp] [Current date]
- updatedBy: [string] "owner_001"
```

### 1.6 Create Empty Collections (No Initial Data Needed)

Create these collections by adding a temporary document, then delete it:

- `taskSubmissions` - Will be populated when employees complete tasks
- `employees` - Will sync with users collection
- `inventory` - Will be populated by managers/employees
- `financialReports` - Will be submitted by managers
- `apepoReports` - Will be submitted by managers
- `requests` - Will be created by managers
- `payroll` - Will be created by managers
- `managerTasks` - Will be assigned by owners
- `notifications` - Will be auto-generated

---

## Phase 2: Firestore Indexes

### Step 2.1: Create Composite Indexes

Go to Firebase Console → Firestore Database → Indexes → Create Index

**Index 1: taskSubmissions by employee and date**
```
Collection: taskSubmissions
Fields:
  - employeeId: Ascending
  - date: Descending
Query scope: Collection
```

**Index 2: taskSubmissions by station and category**
```
Collection: taskSubmissions
Fields:
  - station: Ascending
  - category: Ascending
  - date: Descending
Query scope: Collection
```

**Index 3: inventory by station and status**
```
Collection: inventory
Fields:
  - station: Ascending
  - status: Ascending
Query scope: Collection
```

**Index 4: notifications by recipient**
```
Collection: notifications
Fields:
  - recipientId: Ascending
  - read: Ascending
  - createdAt: Descending
Query scope: Collection
```

**Index 5: requests by status**
```
Collection: requests
Fields:
  - status: Ascending
  - submittedAt: Descending
Query scope: Collection
```

**Index 6: payroll by employee**
```
Collection: payroll
Fields:
  - employeeId: Ascending
  - periodEnd: Descending
Query scope: Collection
```

---

## Phase 3: Security Rules

### Step 3.1: Update Firestore Rules

Go to Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isOwner() {
      return getUserRole() == 'owner';
    }
    
    function isManager() {
      return getUserRole() == 'manager';
    }
    
    function isEmployee() {
      return getUserRole() == 'employee';
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || request.auth.uid == userId;
    }
    
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
    }
    
    match /taskSubmissions/{submissionId} {
      allow read: if isAuthenticated();
      allow create: if isEmployee();
      allow update, delete: if isOwner() || isManager();
    }
    
    match /employees/{employeeId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
    }
    
    match /inventory/{inventoryId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    match /financialReports/{reportId} {
      allow read: if isOwner() || isManager();
      allow write: if isOwner() || isManager();
    }
    
    match /apepoReports/{reportId} {
      allow read: if isOwner() || isManager();
      allow write: if isOwner() || isManager();
    }
    
    match /requests/{requestId} {
      allow read: if isOwner() || isManager();
      allow write: if isOwner() || isManager();
    }
    
    match /payroll/{payrollId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
    }
    
    match /managerTasks/{managerTaskId} {
      allow read: if isOwner() || isManager();
      allow write: if isOwner() || isManager();
    }
    
    match /recipes/{recipeId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
      
      match /views/{viewId} {
        allow read, write: if isAuthenticated();
      }
    }
    
    match /notifications/{notificationId} {
      allow read, update: if isAuthenticated() && request.auth.uid == resource.data.recipientId;
      allow create, delete: if isOwner() || isManager();
    }
    
    match /branches/{branchId} {
      allow read: if isAuthenticated();
      allow write: if isOwner();
    }
    
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner();
    }
  }
}
```

### Step 3.2: Update Storage Rules

Go to Firebase Console → Storage → Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /taskSubmissions/{userId}/{submissionId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    match /financialReports/{reportId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    match /inventory/{inventoryId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    match /recipes/{recipeId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    match /{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

---

## Phase 4: Storage Buckets

### Step 4.1: Create Folder Structure

Firebase Storage creates folders automatically when you upload files. You'll create these paths:

1. `/taskSubmissions/` - For task completion photos
2. `/financialReports/` - For financial report images
3. `/inventory/` - For inventory/waste photos
4. `/recipes/` - For recipe images and videos
5. `/employees/` - For employee profile pictures
6. `/branches/` - For branch logos

---

## Phase 5: Authentication Setup

### Step 5.1: Enable Authentication Methods

Go to Firebase Console → Authentication → Sign-in method

Enable:
- ✅ Email/Password
- ✅ (Optional) Google Sign-In for easier login

### Step 5.2: Create Initial Users

Go to Authentication → Users → Add User

**Owner Account:**
- Email: owner@bluemoon.com
- Password: [Set secure password]
- After creation, go to Firestore and create corresponding document in `users` collection

**Manager Account (for testing):**
- Email: manager@bluemoon.com
- Password: [Set secure password]

**Employee Account (for testing):**
- Email: employee@bluemoon.com
- Password: [Set secure password]

---

## Phase 6: Full Task List to Add

### Kitchen Opening Tasks (8 tasks)
```
task_K_O_001: "Wear proper gear/uniform"
task_K_O_002: "Turn on all equipment"
task_K_O_003: "Sanitize tables, sinks, cutting boards"
task_K_O_004: "Check dishwashing area"
task_K_O_005: "Label and date open items"
task_K_O_006: "Bring out ingredients from storage"
task_K_O_007: "Restock condiments and kitchen supplies"
task_K_O_008: "Sharpen knives and utensils"
```

### Kitchen Closing Tasks (6 tasks)
```
task_K_C_001: "Clean all cooking equipment"
task_K_C_002: "Sanitize all work surfaces"
task_K_C_003: "Store perishables properly"
task_K_C_004: "Sweep and mop kitchen floor"
task_K_C_005: "Take out trash and recycling"
task_K_C_006: "Turn off all equipment"
```

### Coffee Bar Opening Tasks (7 tasks)
```
task_C_O_001: "Turn on espresso machine"
task_C_O_002: "Clean group heads and portafilters"
task_C_O_003: "Grind fresh coffee beans"
task_C_O_004: "Stock milk and dairy products"
task_C_O_005: "Restock cups, lids, and napkins"
task_C_O_006: "Fill syrup pumps and toppings"
task_C_O_007: "Sanitize steam wands"
```

### Coffee Bar Closing Tasks (11 tasks)
```
task_C_C_001: "Backflush espresso machine"
task_C_C_002: "Clean drip trays and portafilters"
task_C_C_003: "Wipe counters and equipment"
task_C_C_004: "Clean blenders and grinders"
task_C_C_005: "Sanitize steam wands"
task_C_C_006: "Store milk and syrups"
task_C_C_007: "Discard expired items"
task_C_C_008: "Restock for tomorrow"
task_C_C_009: "Sweep and mop bar area"
task_C_C_010: "Take out trash"
task_C_C_011: "Turn off all equipment"
```

---

## Phase 7: Testing Checklist

### ✅ Before Going Live, Test:

1. **Authentication:**
   - [ ] Owner can sign in
   - [ ] Manager can sign in
   - [ ] Employee can sign in
   - [ ] Users see correct dashboard based on role

2. **Tasks:**
   - [ ] Employees can view tasks
   - [ ] Employees can submit task with photo
   - [ ] Manager/Owner can view submissions
   - [ ] Photo uploads to Storage correctly

3. **Inventory:**
   - [ ] Can add inventory items
   - [ ] Can update quantities
   - [ ] Status changes based on thresholds

4. **Reports:**
   - [ ] Manager can submit financial reports
   - [ ] Manager can submit APEPO reports
   - [ ] Owner can view all reports

5. **Requests:**
   - [ ] Manager can create requests
   - [ ] Owner can view and respond to requests

6. **Payroll:**
   - [ ] Manager can create payroll entries
   - [ ] Owner can view payroll data

7. **Recipes:**
   - [ ] Employees can view recipes
   - [ ] Videos/images load correctly

8. **Notifications:**
   - [ ] Notifications appear for relevant actions
   - [ ] Can mark as read
   - [ ] Can delete notifications

---

## Phase 8: Optional Enhancements

### Email Configuration (Firebase Functions)
If you want email notifications:
1. Set up Cloud Functions for Firebase
2. Configure SendGrid or similar email service
3. Implement email triggers for key events

### Push Notifications (FCM)
If you want push notifications:
1. Set up Firebase Cloud Messaging
2. Add service worker for web push
3. Request notification permissions

---

## Quick Command Reference

### Firebase CLI Commands (from project root)

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy Cloud Functions (if you create any)
firebase deploy --only functions
```

---

## Support Resources

- **Firestore Documentation**: https://firebase.google.com/docs/firestore
- **Storage Documentation**: https://firebase.google.com/docs/storage
- **Auth Documentation**: https://firebase.google.com/docs/auth
- **Firebase Console**: https://console.firebase.google.com

---

## Summary

**Time Estimate:**
- Phase 1-2: 2-3 hours (creating collections and indexes)
- Phase 3-4: 30 minutes (security rules)
- Phase 5: 15 minutes (authentication)
- Phase 6: 1-2 hours (adding all tasks)
- Phase 7: 1-2 hours (testing)
- **Total: 5-8 hours** for complete setup

**Next Steps After Setup:**
1. Update your `.env.local` with Firebase config ✅ (Already done)
2. Test all user flows thoroughly
3. Add more branches, employees, recipes as needed
4. Consider setting up Cloud Functions for automated tasks
5. Monitor usage in Firebase Console

**You're all set!** 🚀
