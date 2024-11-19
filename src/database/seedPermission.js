import Permission from '~/models/Permission'
import Role from '~/models/Role'

export const seedPermissionsAndRoles = async () => {
  try {
    const permissions = [
      { name: 'manage_users', description: 'Quản lý người dùng' },
      { name: 'manage_products', description: 'Quản lý sản phẩm' },
      { name: 'view_reports', description: 'Xem báo cáo' }
    ]

    const createdPermissions = await Permission.insertMany(permissions)

    const roles = [
      {
        name: 'admin',
        permissions: createdPermissions.map((p) => p._id)
      },
      {
        name: 'manager',
        permissions: [createdPermissions[1]._id]
      },
      {
        name: 'user',
        permissions: []
      }
    ]

    await Role.insertMany(roles)

    // eslint-disable-next-line no-console
    console.log('Seed dữ liệu thành công!')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi seed dữ liệu:', error)
  }
}
