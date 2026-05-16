import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { success } from '../../common/utils/response.util';
import { User } from '../user/user.entity';
import { RecordType } from './student-record.entity';

@ApiTags('学生档案')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('profiles')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '创建学生档案' })
  async createProfile(@Body() createProfileDto: CreateProfileDto) {
    const profile = await this.studentService.createProfile(createProfileDto);
    return success(profile, '档案创建成功');
  }

  @Get('profiles')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有学生档案列表' })
  async getAllProfiles(@Query('grade') grade?: number, @Query('className') className?: string) {
    const profiles = await this.studentService.getAllProfiles(grade, className);
    return success(profiles);
  }

  @Get('profiles/:studentId')
  @ApiOperation({ summary: '获取学生档案详情' })
  async getProfile(@Param('studentId') studentId: string) {
    const profile = await this.studentService.getProfileByStudentId(studentId);
    return success(profile);
  }

  @Put('profiles/:studentId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '更新学生档案' })
  async updateProfile(
    @Param('studentId') studentId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const profile = await this.studentService.updateProfile(studentId, updateProfileDto);
    return success(profile, '档案更新成功');
  }

  @Post('records')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '添加学生记录' })
  async addRecord(@Body() createRecordDto: CreateRecordDto, @CurrentUser() teacher: User) {
    const record = await this.studentService.addRecord(createRecordDto, teacher);
    return success(record, '记录添加成功');
  }

  @Get('records/:studentId')
  @ApiOperation({ summary: '获取学生的所有记录' })
  async getStudentRecords(
    @Param('studentId') studentId: string,
    @Query('type') type?: RecordType,
  ) {
    const records = await this.studentService.getStudentRecords(studentId, type);
    return success(records);
  }

  @Get('records/detail/:id')
  @ApiOperation({ summary: '获取单条记录详情' })
  async getRecordDetail(@Param('id') id: string) {
    const record = await this.studentService.getRecordById(id);
    return success(record);
  }

  @Delete('records/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '删除学生记录' })
  async deleteRecord(@Param('id') id: string) {
    await this.studentService.deleteRecord(id);
    return success(null, '删除成功');
  }
}
