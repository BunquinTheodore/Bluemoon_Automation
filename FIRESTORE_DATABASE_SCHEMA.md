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

## 15. **cupInventoryRecords** Collection
Daily cup inventory records submitted by team members, monitored by managers and owners.

### Document Structure: `/cupInventoryRecords/{recordId}`
```javascript
{
  recordId: string,             // Derived key: {branchSlug}_{YYYY-MM-DD}
  branchId: string,             // Slug form of branch name
  branchName: string,           // Human-readable branch/store name
  date: string,                 // YYYY-MM-DD

  openingCups: number,          // Opening cup count
  cupsSoldToday: number,        // Cups sold for the date
  expectedEndingCups: number,   // openingCups - cupsSoldToday
  actualEndingCups: number,     // Manual tally at end of day
  difference: number,           // actualEndingCups - expectedEndingCups
  hasDiscrepancy: boolean,
  discrepancyStatus: string,    // "OK" | "Inventory Discrepancy"

  submittedByUserId: string,
  submittedByName: string,
  updatedByUserId: string,
  updatedByName: string,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Indexes:**
- `date` (DESC)
- `branchId` (ASC), `date` (DESC)
- `hasDiscrepancy` (ASC), `date` (DESC)

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

    // ---------- Helpers ----------
    // Roles are always resolved from the trusted /users/{uid} document,
    // never from client-supplied request data.
    function isAuthenticated() {
      return request.auth != null;
    }

    function userDocPath() {
      return /databases/$(database)/documents/users/$(request.auth.uid);
    }

    function hasUserDoc() {
      return isAuthenticated() && exists(userDocPath());
    }

    function getUserRole() {
      return get(userDocPath()).data.role;
    }

    function isOwner() {
      return hasUserDoc() && getUserRole() == 'owner';
    }

    function isManager() {
      return hasUserDoc() && getUserRole() == 'manager';
    }

    function isEmployee() {
      return hasUserDoc() && getUserRole() == 'employee';
    }

    function isStaff() {
      return isOwner() || isManager();
    }

    function isKnownRole() {
      return isOwner() || isManager() || isEmployee();
    }

    function changedKeys() {
      return request.resource.data.diff(resource.data).affectedKeys();
    }

    // ---------- users ----------
    match /users/{userId} {
      allow read: if isAuthenticated();
      // Only owners may provision accounts or change roles / status.
      allow create, delete: if isOwner();
      allow update: if isOwner()
        || (request.auth.uid == userId
            && !changedKeys().hasAny(['role', 'isActive', 'email']));
    }

    // ---------- tasks ----------
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create, delete: if isStaff();
      // Employees may only mark a task completed (QR check-in flow).
      allow update: if isStaff()
        || (isEmployee()
            && request.resource.data.status == 'completed'
            && changedKeys().hasOnly(['status', 'completedAt', 'completedBy']));
    }

    // ---------- taskSubmissions ----------
    match /taskSubmissions/{submissionId} {
      allow read: if isAuthenticated();
      allow create: if isStaff()
        || (isEmployee() && request.resource.data.employeeId == request.auth.uid);
      allow update, delete: if isStaff();
    }

    // ---------- employees ----------
    match /employees/{employeeId} {
      allow read: if isAuthenticated();
      allow write: if isStaff();
    }

    // ---------- inventory ----------
    match /inventory/{inventoryId} {
      allow read: if isAuthenticated();
      // Employees submit station counts; only staff may remove items.
      allow create, update: if isKnownRole();
      allow delete: if isStaff();

      match /history/{historyId} {
        allow read: if isAuthenticated();
        // Audit log: append-only.
        allow create: if isKnownRole();
        allow update, delete: if false;
      }
    }

    // ---------- reports / requests ----------
    match /financialReports/{reportId} {
      allow read, write: if isStaff();
    }

    match /apepoReports/{reportId} {
      allow read, write: if isStaff();
    }

    match /requests/{requestId} {
      allow read, write: if isStaff();
    }

    // ---------- payroll ----------
    match /payroll/{payrollId} {
      // Employees may see their own payroll; staff see all.
      allow read: if isStaff()
        || (isAuthenticated() && resource.data.employeeId == request.auth.uid);
      allow write: if isStaff();
    }

    // ---------- managerTasks ----------
    match /managerTasks/{managerTaskId} {
      allow read, write: if isStaff();
    }

    // ---------- recipes ----------
    match /recipes/{recipeId} {
      allow read: if isAuthenticated();
      allow write: if isStaff();

      match /views/{viewId} {
        allow read, create: if isAuthenticated();
        allow update, delete: if isStaff();
      }
    }

    // ---------- notifications ----------
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.recipientId == request.auth.uid;
      // Recipients may only toggle read state.
      allow update: if isAuthenticated()
        && resource.data.recipientId == request.auth.uid
        && changedKeys().hasOnly(['read', 'readAt']);
      allow create, delete: if isStaff();
    }

    // ---------- branches / settings ----------
    match /branches/{branchId} {
      allow read: if isAuthenticated();
      allow write: if isOwner();
    }

    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner();
    }

    // ---------- products / ingredients ----------
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow write: if isOwner();

      match /ingredients/{ingredientId} {
        allow read: if isAuthenticated();
        allow write: if isOwner();
      }
    }

    match /ingredients/{ingredientId} {
      allow read: if isAuthenticated();
      allow write: if isOwner();
    }

    // ---------- cupInventoryRecords ----------
    match /cupInventoryRecords/{recordId} {
      allow read: if isAuthenticated();
      // Team members submit counts; managers/owners review and adjust.
      allow create, update: if isKnownRole();
      // No hard deletes from dashboards.
      allow delete: if false;
    }

    // ---------- emailQueue (Cloud Functions / Admin SDK only) ----------
    match /emailQueue/{mailId} {
      allow read, write: if false;
    }

    // Deny everything not explicitly matched above.
    match /{document=**} {
      allow read, write: if false;
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

    // Roles come from the trusted Firestore /users/{uid} document.
    function getUserRole() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
    }

    function isStaff() {
      return isAuthenticated() && (getUserRole() == 'owner' || getUserRole() == 'manager');
    }

    // Deletes carry no request.resource; uploads must be a bounded image/PDF.
    function isDelete() {
      return request.resource == null;
    }

    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }

    function isPdf() {
      return request.resource.contentType == 'application/pdf';
    }

    function underSizeMb(maxMb) {
      return request.resource.size < maxMb * 1024 * 1024;
    }

    match /taskSubmissions/{userId}/{submissionId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated()
        && request.auth.uid == userId
        && (isDelete() || (isImage() && underSizeMb(10)));
    }

    match /financialReports/{reportId}/{fileName} {
      allow read: if isStaff();
      allow write: if isStaff()
        && (isDelete() || ((isImage() || isPdf()) && underSizeMb(20)));
    }

    match /inventory/{inventoryId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated()
        && (isDelete() || (isImage() && underSizeMb(10)));
    }

    match /recipes/{recipeId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isStaff()
        && (isDelete() || ((isImage() || isPdf()) && underSizeMb(20)));
    }

    // Deny everything not explicitly matched above.
    match /{allPaths=**} {
      allow read, write: if false;
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

Composite indexes are declared in `firestore.indexes.json` and deployed with
`firebase deploy --only firestore:indexes`. Current indexes:

| Collection | Fields |
|---|---|
| `notifications` | `recipientId` ASC, `read` ASC, `createdAt` DESC |
| `payroll` | `employeeId` ASC, `periodEnd` ASC |
| `requests` | `status` ASC, `submittedAt` ASC |
| `taskSubmissions` | `employeeId` ASC, `date` DESC |
| `taskSubmissions` | `station` ASC, `category` ASC, `date` DESC |
| `taskSubmissions` | `station` ASC, `timestamp` DESC |

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
