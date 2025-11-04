import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Task, User } from '../App';
import { Camera, X, RotateCcw, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface QRScanScreenProps {
  task: Task;
  employee: User;
  onBack: () => void;
  onComplete: () => void;
}

export function QRScanScreen({ task, employee, onBack, onComplete }: QRScanScreenProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    // In a real app, this would open the device camera
    // For demo purposes, we'll trigger a file input with camera capture
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setConfirmName('');
  };

  const handleSubmit = async () => {
    if (!confirmName.trim()) {
      toast.error('Please enter your name to confirm');
      return;
    }

    setIsSubmitting(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    toast.success('Task completed successfully!', {
      description: `${task.name} verified by ${confirmName} at ${timeStr} on ${dateStr}`,
    });
    
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Hidden file input for camera simulation */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-black text-white p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg">{task.name}</h1>
            <p className="text-xs text-gray-400">{task.station === 'kitchen' ? 'Kitchen' : 'Coffee Bar'} - {task.category === 'opening' ? 'Opening' : 'Closing'}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md"
            >
              <Card className="bg-gray-900 border-gray-700 p-8">
                <div className="text-center space-y-6">
                  <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl text-white mb-2">Take Task Photo</h2>
                    <p className="text-sm text-gray-400">
                      Capture a photo showing the completed task
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-left">
                    <p className="text-sm text-gray-300 mb-1"><strong>Task:</strong> {task.name}</p>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                  <Button
                    onClick={handleCapture}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-6"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Open Camera
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md space-y-4"
            >
              {/* Preview Image */}
              <Card className="bg-gray-900 border-gray-700 overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured task"
                  className="w-full h-64 object-cover"
                />
              </Card>

              {/* Name Confirmation */}
              <Card className="bg-gray-900 border-gray-700 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg text-white mb-2">Confirm Task Completion</h3>
                    <p className="text-sm text-gray-400">
                      Enter your name to confirm you completed this task
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmName" className="text-white">
                      Your Full Name
                    </Label>
                    <Input
                      id="confirmName"
                      type="text"
                      placeholder="Enter your name"
                      value={confirmName}
                      onChange={(e) => setConfirmName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">
                      <strong className="text-white">Task:</strong> {task.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      <strong className="text-white">Time:</strong> {new Date().toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleRetake}
                      variant="outline"
                      className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !confirmName.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions Footer */}
      <div className="bg-gray-900 text-white p-4 border-t border-gray-800">
        <p className="text-xs text-center text-gray-400">
          {!capturedImage 
            ? 'Take a clear photo showing the completed task' 
            : 'Review your photo and confirm with your name'}
        </p>
      </div>
    </div>
  );
}
