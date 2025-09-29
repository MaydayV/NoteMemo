import { MongoClient, MongoClientOptions } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  appName: "NoteMemo",
};

let client: MongoClient;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // 在开发模式下，使用全局变量以便在热重载时保留连接
    const globalWithMongo = global as typeof globalThis & {
      _mongoClient?: MongoClient;
    };

    if (!globalWithMongo._mongoClient) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClient = client;
    }
    client = globalWithMongo._mongoClient;
  } else {
    // 在生产模式下，不使用全局变量
    client = new MongoClient(uri, options);
    
    // 将客户端连接到Vercel的连接池管理器，确保函数挂起时正确清理
    attachDatabasePool(client);
  }
}

// 导出模块作用域的MongoClient，这样可以在不同函数间共享
export default client; 