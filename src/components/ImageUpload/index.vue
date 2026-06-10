<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadRequestOptions } from 'element-plus'

const modelValue = defineModel<string>({ default: '' })

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }

  return true
}

const readFile = (options: UploadRequestOptions) =>
  new Promise<{ url: string }>((resolve, reject) => {
    const reader = new window.FileReader()

    reader.onload = () => {
      modelValue.value = String(reader.result || '')
      const result = { url: modelValue.value }
      options.onSuccess(result)
      resolve(result)
    }

    reader.onerror = () => {
      ElMessage.error('读取图片失败')
      reject(new Error('读取图片失败'))
    }

    reader.readAsDataURL(options.file)
  })

const removeImage = () => {
  modelValue.value = ''
}
</script>

<template>
  <div class="image-upload">
    <el-upload
      class="uploader"
      accept="image/*"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="readFile"
    >
      <img v-if="modelValue" class="preview" :src="modelValue" alt="" />
      <el-icon v-else class="upload-icon">
        <Plus />
      </el-icon>
    </el-upload>

    <el-button v-if="modelValue" link type="danger" @click="removeImage">移除图片</el-button>
  </div>
</template>

<style scoped>
.image-upload {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.uploader :deep(.el-upload) {
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  overflow: hidden;
  color: #909399;
  cursor: pointer;
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
}

.uploader :deep(.el-upload:hover) {
  color: #409eff;
  border-color: #409eff;
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-icon {
  font-size: 28px;
}
</style>
