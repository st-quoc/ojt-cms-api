import Joi from 'joi'

export const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.min': 'Tên phải có ít nhất 3 ký tự.',
      'any.required': 'Vui lòng điền tên của bạn.',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Địa chỉ Email không hợp lệ.',
      'any.required': 'Vui lòng điền địa chỉ Email.',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
      'any.required': 'Vui lòng điền mật khẩu của bạn.',
    }),
    address: Joi.string().optional(),
  })
  return schema.validate(data)
}

export const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Vui lòng điền địa chỉ Email.',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
      'any.required': 'Vui lòng điền điền mật khẩu.',
    }),
  })
  return schema.validate(data)
}

export const managerCreationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.min': 'Tên phải có ít nhất 3 ký tự.',
      'any.required': 'Vui lòng điền tên của bạn.',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Địa chỉ Email không hợp lệ.',
      'any.required': 'Vui lòng điền địa chỉ Email.',
    }),
    phoneNumber: Joi.string().min(10).max(15).required().messages({
      'string.min': 'Số điện thoại phải có ít nhất 10 ký tự.',
      'string.max': 'Số điện thoại không thể dài quá 15 ký tự.',
      'any.required': 'Vui lòng điền số điện thoại.',
    }),
    status: Joi.string().valid('active', 'inactive').required().messages({
      'any.required': 'Vui lòng chọn trạng thái.',
      'any.only': 'Trạng thái không hợp lệ.',
    }),
    role: Joi.string().valid('admin', 'manager', 'user').required().messages({
      'any.required': 'Vui lòng chọn vai trò.',
      'any.only': 'Vai trò không hợp lệ.',
    }),
    permissions: Joi.array().min(1).items(Joi.string()).required().messages({
      'array.min': 'Phải chọn ít nhất một quyền.',
      'any.required': 'Vui lòng chọn quyền.',
    }),
  })

  return schema.validate(data)
}

export const managerUpdateValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).optional().messages({
      'string.min': 'Tên phải có ít nhất 3 ký tự.',
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Địa chỉ Email không hợp lệ.',
    }),
    phoneNumber: Joi.string().min(10).max(15).optional().messages({
      'string.min': 'Số điện thoại phải có ít nhất 10 ký tự.',
      'string.max': 'Số điện thoại không thể dài quá 15 ký tự.',
    }),
    status: Joi.string().valid('active', 'inactive').optional().messages({
      'any.only': 'Trạng thái không hợp lệ.',
    }),
    role: Joi.string().valid('admin', 'manager', 'user').optional().messages({
      'any.only': 'Vai trò không hợp lệ.',
    }),
    permissions: Joi.array().items(Joi.string()).optional().messages({
      'array.min': 'Phải chọn ít nhất một quyền.',
    }),
  })

  return schema.validate(data)
}
