
export const StudentEntity = {
  code: true,
  birthdate: true,
  gender: true,
  school: true,
  grade: true,
  educationLevel: true,
  tutors: {
    select: {
      user: {
        select: {
          numberDocument: true,
          typeDocument: true,
          name: true,
          lastName: true,
          email: true,
          phone: true,
        }
      },
      city: true,
      zone: true,
      address: true,
    }
  },
};