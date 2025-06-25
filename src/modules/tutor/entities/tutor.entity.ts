export const TutorEntity = {
  city: true,
  zone: true,
  address: true,
  students: {
    select: {
      user:{
        select: {
          numberDocument: true,
          typeDocument: true,
          name: true,
          lastName: true,
          email: true,
        }
      },
      code: true,
      birthdate: true,
      gender: true,
      school: true,
      grade: true,
      educationLevel: true,
    }
  },
};