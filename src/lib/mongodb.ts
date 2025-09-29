import 'server-only';
import { MongoClient, ServerApiVersion } from 'mongodb';

// 环境变量中的MongoDB连接字符串
const uri = process.env.MONGODB_URI || '';

// 全局变量，用于在应用生命周期内复用连接
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// 检查MongoDB URI是否已配置
if (!uri) {
  throw new Error('请添加MongoDB连接字符串到环境变量MONGODB_URI');
}

// 在开发环境中复用连接
if (process.env.NODE_ENV === 'development') {
  // 在开发环境中使用全局变量保存连接
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // 在生产环境中创建新的连接
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
}

// 导出连接Promise，以便在其他文件中使用
export default clientPromise;

// 辅助函数：获取数据库实例
export async function getDatabase(dbName: string = 'notememo') {
  const client = await clientPromise;
  return client.db(dbName);
}

// 辅助函数：获取集合
export async function getCollection(collectionName: string, dbName: string = 'notememo') {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}

// 检查连接
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    console.log('MongoDB连接成功');
    return true;
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    return false;
  }
} 