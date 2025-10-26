import { NextRequest, NextResponse } from 'next/server';
import { cosService } from '@/lib/cosService';

export async function GET(request: NextRequest) {
  console.log('🔍 [API] 收到COS连接测试请求');
  
  try {
    // 测试COS连接
    const result = await cosService.testConnection();

    console.log('📊 [API] COS测试结果:', {
      success: result.success,
      error: result.error
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '腾讯云COS连接测试成功',
        data: {
          bucket: process.env.TENCENT_COS_BUCKET,
          region: process.env.TENCENT_COS_REGION,
          pathPrefix: process.env.TENCENT_COS_PATH_PREFIX
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'COS连接测试失败'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [API] COS测试API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('📤 [API] 收到COS文件上传测试请求');
  
  try {
    const body = await request.json();
    const { fileUrl, fileName } = body;

    console.log('📝 [API] 上传测试参数:', {
      fileUrl: fileUrl,
      fileName: fileName
    });

    if (!fileUrl || !fileName) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数：fileUrl 或 fileName'
      }, { status: 400 });
    }

    // 从URL上传文件到COS
    const result = await cosService.uploadFromUrl(fileUrl, fileName);

    console.log('📊 [API] COS上传结果:', {
      success: result.success,
      url: result.url,
      error: result.error
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '文件上传到COS成功',
        data: {
          url: result.url,
          key: result.key
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || '文件上传失败'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 [API] COS上传测试API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}
