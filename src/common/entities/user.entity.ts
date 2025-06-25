import { StaffEntity } from '@/modules/staff/entities/staff.entity';
import { StudentEntity } from '@/modules/student/entities/student.entity';
import { TeacherEntity } from '@/modules/teacher/entities/teacher.entity';
import { TutorEntity } from '@/modules/tutor/entities/tutor.entity';

export const UserEntity = {
  id: true,
  numberDocument: true,
  typeDocument: true,
  name: true,
  lastName: true,
  email: true,
  phone: true,
  staff: {
    select: StaffEntity,
  },
  tutor: {
    select: TutorEntity,
  },
  teacher: {
    select: TeacherEntity,
  },
  student: {
    select: StudentEntity,
  }
};