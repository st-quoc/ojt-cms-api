const Joi = require("joi");

exports.registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required().messages({
      "string.min": "Tên phải có ít nhất 3 ký tự.",
      "any.required": "Vui lòng điền tên của bạn.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Địa chỉ Email không hợp lệ.",
      "any.required": "Vui lòng điền địa chỉ Email.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
      "any.required": "Vui lòng điền mật khẩu của bạn.",
    }),
    address: Joi.string().optional(),
  });
  return schema.validate(data);
};

exports.loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Vui lòng điền địa chỉ Email.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
      "any.required": "Vui lòng điền điền mật khẩu.",
    }),
  });
  return schema.validate(data);
};
