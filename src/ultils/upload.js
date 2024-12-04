import axios from 'axios'
import FormData from 'form-data'
import dotenv from 'dotenv'

dotenv.config()

export const uploadImagesToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map((file) => {
      const form = new FormData()
      form.append('file', file.buffer, file.originalname)
      form.append('upload_preset', 'ml_default')

      return axios.post(
        'https://api.cloudinary.com/v1_1/dcn6yeznv/image/upload',
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        }
      )
    })

    const uploadResults = await Promise.all(uploadPromises)

    const imageUrls = uploadResults.map((result) => result.data.secure_url)

    return imageUrls
  } catch (error) {
    throw new Error('Failed to upload images')
  }
}
