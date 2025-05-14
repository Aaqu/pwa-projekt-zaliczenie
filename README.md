"# pwa-projekt-zaliczenie" 

Ss first step run 'npm install' in BE directory

For run server you need a .env file witch should looks like this

VAPID_PUBLIC_KEY=[GENERATED PUBLIC KEY]
VAPID_PRIVATE_KEY=[GENERATED PRIVATE KEY]
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.bmtziqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0


to generate VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY run in BE directory below commands:
web-push generate-vapid-keys

For MONGODB_URI go to MongoDB Atlas and search for cluster connections

to run server execute in BE directory:
node server.js