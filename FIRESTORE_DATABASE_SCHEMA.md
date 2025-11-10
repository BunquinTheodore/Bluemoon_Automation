# Firestore Database Schema - Bluemoon Business Management App

## Complete Database Structure

This document defines all Firestore collections, subcollections, and their field structures needed for the Bluemoon Business Management Application.

---

## 1. **users** Collection
Stores user authentication and profile information for all roles (owner, manager, employee).

### Document Structure: `/users/{userId}`
```javascript
{
  userId: string,              // Firebase Auth UID
  email: string,               // User email
  name: string,                // Full name
  role: string,                // "owner" | "manager" | "employee"
  contactNumber: string,       // Phone number
  status: string,              // "full-time" | "part-time" (for employees)
  position: string,            // Job title (e.g., "Senior Barista", "Kitchen Lead")
  birthday: string,            // Birthday date (YYYY-MM-DD)
  joinDate: timestamp,         // Date joined the company
  branch: string,              // "Downtown Branch" | "Uptown Branch" | etc.
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean            // Account status
}
```

**Indexes:**
- `role` (ASC), `isActive` (ASC)
- `branch` (ASC), `status` (ASC)

---

## 2. **tasks** Collection
Master list of task templates for opening/closing procedures.

### Document Structure: `/tasks/{taskId}`
```javascript
{
  taskId: string,
  name: string,                // Task name
  qrCodeId: string,            // Unique QR code identifier (e.g., "QR-K-O-001")
  station: string,             // "kitchen" | "coffee-bar"
  category: string,            // "opening" | "closing"
  description: string,         // Task description/instructions
  branch: string,              // Branch this task belongs to
  order: number,               // Display order in the list
  isActive: boolean,           // Whether task is currently in use
  createdAt: timestamp,
  createdBy: string,           // User ID who created this task
  updatedAt: timestamp
}
```

**Indexes:**
- `station` (ASC), `category` (ASC), `order` (ASC)
- `branch` (ASC), `isActive` (ASC)
- `qrCodeId` (ASC) - unique

---

## 3. **taskSubmissions** Collection
Employee task completion submissions with photo proof.

### Document Structure: `/taskSubmissions/{submissionId}`
```javascript
{
  submissionId: string,
  taskId: string,              // Reference to tasks collection
  taskName: string,            // Denormalized for quick access
  employeeId: string,          // User ID of employee
  employeeName: string,        // Denormalized employee name
  confirmedName: string,       // Name entered by employee to confirm
  station: string,             // "kitchen" | "coffee-bar"
  category: string,            // "opening" | "closing"
  branch: string,
  photoUrl: string,            // Firebase Storage URL
  photoPath: string,           // Storage path for deletion
  qrCodeId: string,            // QR code scanned
  timestamp: timestamp,        // When task was completed
  date: string,                // Date in YYYY-MM-DD format for querying
  location: string,            // Task location
  verified: boolean,           // Manager/owner verification status
  verifiedBy: string,          // User ID who verified (optional)
  verifiedAt: timestamp,       // When verified (optional)
  notes: string                // Optional notes from verifier
}
```

**Indexes:**
- `date` (DESC), `timestamp` (DESC)
- `employeeId` (ASC), `date` (DESC)
- `station` (ASC), `category` (ASC), `date` (DESC)
- `branch` (ASC), `verified` (ASC)

---

## 4. **employees** Collection
Detailed employee management (can duplicate some user data for business logic).

### Document Structure: `/employees/{employeeId}`
```javascript
{
  employeeId: string,          // Same as userId
  name: string,
  email: string,
  contactNumber: string,
  position: string,
  status: string,              // "full-time" | "part-time"
  branch: string,
  birthday: string,            // YYYY-MM-DD
  joinDate: timestamp,
  payRate: number,             // Daily pay rate in pesos
  tasksCompleted: number,      // Total tasks completed (counter)
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `branch` (ASC), `isActive` (ASC)
- `status` (ASC), `isActive` (ASC)

---

## 5. **inventory** Collection
Inventory management for kitchen and coffee bar.

### Document Structure: `/inventory/{inventoryId}`
```javascript
{
  inventoryId: string,
  productName: string,
  unit: string,                // "kg" | "gram" | "no. of package" | "no. of can" | "pcs" | "bottle" | "no. of roll" | "sleeve"
  sealed: number,              // Quantity of sealed items
  loose: number,               // Quantity of loose/opened items
  total: number,               // sealed + loose (computed)
  station: string,             // "kitchen" | "coffee-bar"
  status: string,              // "good" | "low" | "critical"
  lowStockThreshold: number,   // Trigger for "low" status
  criticalThreshold: number,   // Trigger for "critical" status
  branch: string,
  dateDelivered: string,       // YYYY-MM-DD
  lastUpdated: timestamp,
  updatedBy: string,           // User ID (employee/manager)
  ownerDelivered: number,      // Quantity delivered by owner (optional)
  ownerDateDelivered: string,  // YYYY-MM-DD (optional)
  notes: string                // Optional notes
}
```

**Indexes:**
- `station` (ASC), `branch` (ASC)
- `status` (ASC), `branch` (ASC)
- `lastUpdated` (DESC)

### Subcollection: `/inventory/{inventoryId}/history/{historyId}`
Track inventory changes over time.
```javascript
{
  historyId: string,
  sealed: number,
  loose: number,
  total: number,
  action: string,             // "updated" | "added" | "delivered"
  changedBy: string,          // User ID
  changedByName: string,
  timestamp: timestamp,
  notes: string
}
```

---

## 6. **financialReports** Collection
Daily financial reports submitted by managers.

### Document Structure: `/financialReports/{reportId}`
```javascript
{
  reportId: string,
  managerId: string,           // User ID of manager
  managerName: string,
  branch: string,
  date: string,                // YYYY-MM-DD
  
  // Opening Shift Data
  opening: {
    cash: number,              // Starting cash
    digitalWallet: number,     // Starting digital wallet
    bankAmount: number,        // Starting bank amount
    turnoverCash: number,      // Turnover cash
    turnoverDigital: number,   // Turnover digital wallet
    turnoverBank: number,      // Turnover bank
    total: number,             // Computed total
    imageUrl: string,          // Receipt/proof photo URL
    imagePath: string          // Storage path
  },
  
  // Closing Shift Data
  closing: {
    cash: number,
    digitalWallet: number,
    bankAmount: number,
    turnoverCash: number,
    turnoverDigital: number,
    turnoverBank: number,
    total: number,
    imageUrl: string,
    imagePath: string
  },
  
  // Computed Fields
  totalEarnings: number,       // closing.total - opening.total
  
  // Manager Fund (optional)
  managerFund: {
    amount: number,
    imageUrl: string,
    imagePath: string,
    notes: string
  },
  
  // Expenses
  expenses: string,            // Text description of expenses
  
  // Verification
  status: string,              // "pending" | "approved" | "rejected"
  verifiedBy: string,          // Owner user ID (optional)
  verifiedAt: timestamp,       // (optional)
  verificationNotes: string,   // (optional)
  
  submittedAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `date` (DESC)
- `branch` (ASC), `date` (DESC)
- `status` (ASC), `date` (DESC)

---

## 7. **apepoReports** Collection
APEPO (Audit, People, Equipment, Product, Others) reports from managers.

### Document Structure: `/apepoReports/{reportId}`
```javascript
{
  reportId: string,
  managerId: string,
  managerName: string,
  branch: string,
  date: string,                // YYYY-MM-DD
  
  audit: string,               // Audit section details
  people: string,              // People/employees section
  equipment: string,           // Equipment check section
  product: string,             // Product/inventory section
  others: string,              // Other notes/observations
  
  submittedAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `date` (DESC)
- `branch` (ASC), `date` (DESC)

---

## 8. **requests** Collection
Manager requests for supplies/items to owner.

### Document Structure: `/requests/{requestId}`
```javascript
{
  requestId: string,
  managerId: string,
  managerName: string,
  branch: string,
  
  itemName: string,            // Item requested
  quantity: number,
  unit: string,                // Unit of measurement
  priority: string,            // "low" | "medium" | "high"
  remarks: string,             // Additional notes/reasons
  
  status: string,              // "pending" | "approved" | "rejected" | "fulfilled"
  respondedBy: string,         // Owner user ID (optional)
  respondedAt: timestamp,      // (optional)
  responseNotes: string,       // Owner's response notes (optional)
  
  submittedAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `status` (ASC), `submittedAt` (DESC)
- `priority` (DESC), `status` (ASC)
- `branch` (ASC), `status` (ASC)

---

## 9. **payroll** Collection
Employee payroll records.

### Document Structure: `/payroll/{payrollId}`
```javascript
{
  payrollId: string,
  employeeId: string,
  employeeName: string,
  employeeStatus: string,      // "full-time" | "part-time"
  branch: string,
  
  period: string,              // "Oct 16-22, 2025"
  periodStart: string,         // YYYY-MM-DD
  periodEnd: string,           // YYYY-MM-DD
  
  daysWorked: number,
  payRate: number,             // Daily rate
  totalPay: number,            // daysWorked * payRate
  
  isPaid: boolean,             // Payment status
  paidAt: timestamp,           // (optional)
  paidBy: string,              // User ID who marked as paid (optional)
  
  notes: string,               // Optional notes
  createdBy: string,           // Manager or owner user ID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `periodEnd` (DESC)
- `employeeId` (ASC), `periodEnd` (DESC)
- `isPaid` (ASC), `periodEnd` (DESC)

---

## 10. **managerTasks** Collection
Tasks assigned by owner to managers.

### Document Structure: `/managerTasks/{managerTaskId}`
```javascript
{
  managerTaskId: string,
  name: string,                // Task name
  description: string,         // Task details
  taskType: string,            // "daily" | "weekly"
  day: string,                 // For weekly: "Monday" | "Friday" | etc. (optional)
  icon: string,                // Icon identifier (optional)
  
  assignedTo: string,          // Manager user ID
  assignedToName: string,
  assignedBy: string,          // Owner user ID
  assignedByName: string,
  branch: string,
  
  status: string,              // "pending" | "completed"
  completedAt: timestamp,      // (optional)
  completedNotes: string,      // Manager's completion notes (optional)
  
  dueDate: string,             // YYYY-MM-DD (optional for daily tasks)
  assignedDate: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `assignedTo` (ASC), `status` (ASC)
- `taskType` (ASC), `status` (ASC)
- `dueDate` (ASC), `status` (ASC)

---

## 11. **recipes** Collection
Recipe and training content for employees.

### Document Structure: `/recipes/{recipeId}`
```javascript
{
  recipeId: string,
  name: string,                // Recipe name
  description: string,         // Short description
  category: string,            // "Hot Drinks" | "Cold Drinks" | "Techniques" | etc.
  
  imageUrl: string,            // Recipe image URL
  imagePath: string,           // Storage path
  
  videoDuration: string,       // "2:30"
  videoUrl: string,            // YouTube embed URL or Storage URL
  
  ingredients: [               // Array of ingredients
    string,
    string,
    ...
  ],
  
  steps: [                     // Array of preparation steps
    string,
    string,
    ...
  ],
  
  tools: [                     // Array of required tools
    string,
    string,
    ...
  ],
  
  difficulty: string,          // "easy" | "medium" | "hard"
  prepTime: number,            // Minutes
  
  isActive: boolean,           // Whether recipe is published
  createdBy: string,           // User ID
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `category` (ASC), `isActive` (ASC)
- `createdAt` (DESC)

### Subcollection: `/recipes/{recipeId}/views/{viewId}`
Track who has watched/completed recipes.
```javascript
{
  viewId: string,
  userId: string,
  userName: string,
  watchedAt: timestamp,
  completed: boolean
}
```

---

## 12. **notifications** Collection
System notifications for all users.

### Document Structure: `/notifications/{notificationId}`
```javascript
{
  notificationId: string,
  recipientId: string,         // User ID of recipient
  recipientRole: string,       // "owner" | "manager" | "employee"
  
  type: string,                // "task_completed" | "task_overdue" | "request_submitted" | "report_submitted" | etc.
  title: string,               // Notification title
  message: string,             // Notification message
  
  // Related Entity References
  taskId: string,              // (optional) Related task
  taskName: string,            // (optional)
  employeeId: string,          // (optional) Related employee
  employeeName: string,        // (optional)
  
  // Status
  read: boolean,               // Whether notification has been read
  readAt: timestamp,           // (optional)
  
  // Action URL (optional)
  actionUrl: string,           // Deep link to related screen/entity
  
  createdAt: timestamp,
  expiresAt: timestamp         // Notifications can expire
}
```

**Indexes:**
- `recipientId` (ASC), `read` (ASC), `createdAt` (DESC)
- `recipientId` (ASC), `type` (ASC), `createdAt` (DESC)

---

## 13. **branches** Collection
Business branch/location management.

### Document Structure: `/branches/{branchId}`
```javascript
{
  branchId: string,
  name: string,                // "Downtown Branch" | "Uptown Branch"
  address: string,
  city: string,
  phone: string,
  email: string,
  
  managerId: string,           // Assigned manager user ID
  managerName: string,
  
  isActive: boolean,
  openingHours: {
    monday: { open: string, close: string },    // "08:00" - "20:00"
    tuesday: { open: string, close: string },
    wednesday: { open: string, close: string },
    thursday: { open: string, close: string },
    friday: { open: string, close: string },
    saturday: { open: string, close: string },
    sunday: { open: string, close: string }
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `isActive` (ASC)

---

## 14. **settings** Collection
System-wide settings and configuration.

### Document Structure: `/settings/general`
```javascript
{
  // Inventory Thresholds
  inventoryThresholds: {
    lowStockPercentage: number,      // % of normal stock to trigger "low"
    criticalStockPercentage: number  // % of normal stock to trigger "critical"
  },
  
  // Notifications
  notifications: {
    enableEmail: boolean,
    enablePush: boolean,
    taskOverdueHours: number         // Hours before task is considered overdue
  },
  
  // Company Info
  companyName: string,
  companyLogo: string,               // Storage URL
  
  updatedAt: timestamp,
  updatedBy: string
}
```

---

## Storage Buckets Organization

### Firebase Storage Structure:
```
/taskSubmissions/{userId}/{submissionId}/photo.jpg
/financialReports/{reportId}/opening.jpg
/financialReports/{reportId}/closing.jpg
/financialReports/{reportId}/managerFund.jpg
/inventory/{inventoryId}/wastedPhoto.jpg
/recipes/{recipeId}/image.jpg
/recipes/{recipeId}/video.mp4
/employees/{employeeId}/profile.jpg
/branches/{branchId}/logo.jpg
```

---

## Security Rules Outline

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
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
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || request.auth.uid == userId;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
    }
    
    // Task Submissions
    match /taskSubmissions/{submissionId} {
      allow read: if isAuthenticated();
      allow create: if isEmployee() && request.auth.uid == request.resource.data.employeeId;
      allow update: if isOwner() || isManager(); // For verification
      allow delete: if isOwner();
    }
    
    // Employees
    match /employees/{employeeId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
    }
    
    // Inventory
    match /inventory/{inventoryId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // All can update inventory
    }
    
    // Financial Reports
    match /financialReports/{reportId} {
      allow read: if isOwner() || isManager();
      allow create: if isManager();
      allow update: if isOwner() || isManager();
      allow delete: if isOwner();
    }
    
    // APEPO Reports
    match /apepoReports/{reportId} {
      allow read: if isOwner() || isManager();
      allow create: if isManager();
      allow update: if isOwner() || isManager();
      allow delete: if isOwner();
    }
    
    // Requests
    match /requests/{requestId} {
      allow read: if isOwner() || isManager();
      allow create: if isManager();
      allow update: if isOwner() || isManager();
      allow delete: if isOwner();
    }
    
    // Payroll
    match /payroll/{payrollId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
    }
    
    // Manager Tasks
    match /managerTasks/{managerTaskId} {
      allow read: if isOwner() || isManager();
      allow create: if isOwner();
      allow update: if isOwner() || (isManager() && request.auth.uid == resource.data.assignedTo);
      allow delete: if isOwner();
    }
    
    // Recipes
    match /recipes/{recipeId} {
      allow read: if isAuthenticated();
      allow write: if isOwner() || isManager();
      
      match /views/{viewId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
      }
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && request.auth.uid == resource.data.recipientId;
      allow update: if isAuthenticated() && request.auth.uid == resource.data.recipientId;
      allow create, delete: if isOwner() || isManager();
    }
    
    // Branches
    match /branches/{branchId} {
      allow read: if isAuthenticated();
      allow write: if isOwner();
    }
    
    // Settings
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner();
    }
  }
}
```

### Storage Rules:
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

## Initial Data Setup

### Recommended Initial Collections to Create:

1. **Create a default owner user** via Firebase Authentication
2. **Add initial branches** in the `branches` collection
3. **Add default tasks** in the `tasks` collection for both stations
4. **Add sample recipes** in the `recipes` collection
5. **Configure settings** in the `settings/general` document

---

## Cloud Functions Recommendations

Consider implementing these Cloud Functions:

1. **onTaskSubmissionCreate**: Send notification to manager/owner
2. **onRequestCreate**: Notify owner of new request
3. **onFinancialReportCreate**: Notify owner of new report
4. **updateInventoryStatus**: Auto-update status based on thresholds
5. **cleanupOldNotifications**: Delete expired notifications
6. **aggregatePayrollData**: Calculate totals for payroll periods
7. **generateDailyReports**: Auto-generate daily summary reports

---

## Composite Indexes Required

Run these in Firebase Console or via Firebase CLI:

```bash
# Task Submissions
firestore.createIndex('taskSubmissions', [
  { field: 'employeeId', order: 'ASCENDING' },
  { field: 'date', order: 'DESCENDING' }
])

# Inventory
firestore.createIndex('inventory', [
  { field: 'station', order: 'ASCENDING' },
  { field: 'status', order: 'ASCENDING' }
])

# Notifications
firestore.createIndex('notifications', [
  { field: 'recipientId', order: 'ASCENDING' },
  { field: 'read', order: 'ASCENDING' },
  { field: 'createdAt', order: 'DESCENDING' }
])
```

---

## Summary

**Total Collections**: 14 main collections
**Total Subcollections**: 2 (recipe views, inventory history)
**Total Indexes**: ~20+ composite indexes
**Storage Buckets**: 6 main directories

This schema supports:
- ✅ Multi-role user management (owner, manager, employee)
- ✅ Task assignment and photo verification
- ✅ Inventory tracking with auto-status
- ✅ Financial reporting and APEPO reports
- ✅ Manager request management
- ✅ Payroll tracking
- ✅ Recipe/training content
- ✅ Real-time notifications
- ✅ Multi-branch operations

**Estimated Document Growth** (per month):
- taskSubmissions: ~1,000-3,000 docs
- inventory: ~100-200 docs
- financialReports: ~30-60 docs
- notifications: ~500-1,500 docs
- Other collections: Stable/slow growth

**Scalability**: This schema is designed to handle multiple branches, hundreds of employees, and thousands of daily operations efficiently.
