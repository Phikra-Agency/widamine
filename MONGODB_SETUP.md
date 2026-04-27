# MongoDB Setup for Widamine

## ✅ Installation Complete

### MongoDB Server
- **Version**: 7.0.12
- **Data Directory**: `/data/db`
- **Log File**: `/var/log/mongodb/mongod.log`
- **Connection URL**: `mongodb://127.0.0.1:27017/widamine`
- **Port**: 27017
- **Status**: Running

### MongoDB Shell (mongosh)
- **Version**: 2.2.12
- **Path**: `/usr/local/bin/mongosh`

### Binaries Location
- **mongod**: `/usr/local/bin/mongod`
- **mongos**: `/usr/local/bin/mongos`
- **mongosh**: `/usr/local/bin/mongosh`

---

## 🔧 Backend Configuration

### Environment Variables (.env)
```env
JWT_SECRET=widamine_jwt_secret_key_2024_secure_random_string
PORT=3000
HOST=0.0.0.0
DATABASE_URL=mongodb://127.0.0.1:27017/widamine
```

### Prisma Schema Changes
- **Database**: Changed from SQLite to MongoDB
- **All IDs**: Changed from `Int` to `String @db.ObjectId`
- **Relations**: Updated to use MongoDB-compatible syntax
- **Indexes**: Added for performance optimization

### New Features Implemented
1. **Resource Priority**: Added `priority` field to Resource model
2. **Resource-Doctor Relations**: New `ResourcePractitioner` many-to-many model
3. **Patient Deduplication**: `findOrCreateByPhone()` method merges patients by phone number
4. **Appointment-Patient Linking**: Appointments now link to existing or new patients by phone

---

## 🚀 Usage

### Start MongoDB
```bash
# Using the startup script
./start-mongodb.sh

# Or manually
mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /data/db --bind_ip 127.0.0.1
```

### Stop MongoDB
```bash
mongod --dbpath /data/db --shutdown
```

### Connect to MongoDB Shell
```bash
mongosh
# or
mongosh mongodb://127.0.0.1:27017/widamine
```

### Regenerate Prisma Client
```bash
cd backend
npx prisma generate
```

---

## 📁 Files Modified

### Frontend
- `frontend/src/components/layouts/BackOfficeLayout.tsx` - Removed top bar, redesigned sidebar
- `frontend/src/pages/back-office/Dashboard.tsx` - Bento grid layout, minimalistic design

### Backend
- `backend/prisma/schema.prisma` - MongoDB migration, Resource priority, Resource-Doctor relations
- `backend/src/patient/patient.service.ts` - Phone-based deduplication
- `backend/src/patient/patient.controller.ts` - Added findByPhone endpoint
- `backend/src/patient/dto/create-patient.dto.ts` - Made fields optional
- `backend/src/appointment/appointment.service.ts` - Patient linking on creation
- `backend/src/appointment/appointment.controller.ts` - Updated for string IDs
- `backend/src/appointment/appointment.module.ts` - Added PatientModule import
- `backend/src/patient/patient.module.ts` - Exported PatientService
- `backend/.env` - Updated DATABASE_URL for MongoDB

### New Files
- `start-mongodb.sh` - MongoDB startup script
- `MONGODB_SETUP.md` - This documentation

---

## 🔍 Verification Commands

### Check MongoDB Status
```bash
pgrep -a mongod
```

### Test Connection
```bash
mongosh --eval "db.adminCommand('ping')"
```

### View Logs
```bash
tail -f /var/log/mongodb/mongod.log
```

### Access Database
```bash
mongosh widamine
```

---

## 📝 Next Steps

1. **Install dependencies**:
   ```bash
   cd /home/alan/widamine/backend
   npm install mongodb --save --legacy-peer-deps
   ```

2. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   ```

3. **Start the backend**:
   ```bash
   npm run start:dev
   ```

4. **Start the frontend**:
   ```bash
   cd /home/alan/widamine/frontend
   npm run dev
   ```

---

## 🆘 Troubleshooting

### If MongoDB fails to start:
- Check data directory permissions: `ls -la /data/db`
- Check log file: `tail /var/log/mongodb/mongod.log`
- Ensure port 27017 is not in use: `lsof -i :27017`

### If Prisma generate fails:
- Ensure DATABASE_URL is correct in .env
- Check MongoDB is running: `pgrep mongod`
- Try: `npx prisma generate --schema=./prisma/schema.prisma`

### TypeScript errors after migration:
- These will resolve after running `npx prisma generate`
- Restart TypeScript server in your IDE
