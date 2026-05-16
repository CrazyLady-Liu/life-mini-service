import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { GradeHomeworkDto } from './dto/grade-homework.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { success } from '../../common/utils/response.util';
import { User } from '../user/user.entity';
import { HomeworkStatus } from './homework.entity';
import { SubmissionStatus } from './homework-submission.entity';

@ApiTags('作业管理')
@Controller('homeworks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '创建作业（支持自动生成）' })
  async create(@Body() createHomeworkDto: CreateHomeworkDto, @CurrentUser() teacher: User) {
    const homework = await this.homeworkService.create(createHomeworkDto, teacher);
    return success(homework, '作业创建成功');
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '发布作业' })
  async publish(@Param('id') id: string, @CurrentUser() teacher: User) {
    const homework = await this.homeworkService.publish(id, teacher);
    return success(homework, '作业发布成功');
  }

  @Get()
  @ApiOperation({ summary: '获取作业列表' })
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: HomeworkStatus,
  ) {
    const teacherId = user.role === UserRole.TEACHER ? user.id : undefined;
    const homeworks = await this.homeworkService.findAll(teacherId, status);
    return success(homeworks);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取作业详情' })
  async findOne(@Param('id') id: string) {
    const homework = await this.homeworkService.findOne(id);
    return success(homework);
  }

  @Get('student/my')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: '学生获取自己的作业列表' })
  async getMyHomeworks(
    @CurrentUser() student: User,
    @Query('status') status?: SubmissionStatus,
  ) {
    const submissions = await this.homeworkService.getStudentHomeworks(student.id, status);
    return success(submissions);
  }

  @Post('submissions/:id/start')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: '学生开始做作业' })
  async startHomework(
    @Param('id') submissionId: string,
    @CurrentUser() student: User,
  ) {
    const submission = await this.homeworkService.startHomework(submissionId, student.id);
    return success(submission, '开始答题');
  }

  @Post('submissions/:id/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: '学生提交作业' })
  async submitHomework(
    @Param('id') submissionId: string,
    @CurrentUser() student: User,
    @Body() submitDto: SubmitHomeworkDto,
  ) {
    const submission = await this.homeworkService.submitHomework(submissionId, student.id, submitDto);
    return success(submission, '提交成功');
  }

  @Post('submissions/:id/grade')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '教师批改作业' })
  async gradeSubmission(
    @Param('id') submissionId: string,
    @CurrentUser() teacher: User,
    @Body() gradeDto: GradeHomeworkDto,
  ) {
    const submission = await this.homeworkService.gradeSubmission(submissionId, gradeDto, teacher);
    return success(submission, '批改完成');
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: '获取作业提交详情' })
  async getSubmission(@Param('id') submissionId: string) {
    const submission = await this.homeworkService.getSubmission(submissionId);
    return success(submission);
  }

  @Get(':id/submissions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '获取作业的所有提交记录' })
  async getHomeworkSubmissions(@Param('id') homeworkId: string) {
    const submissions = await this.homeworkService.getHomeworkSubmissions(homeworkId);
    return success(submissions);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '删除作业' })
  async delete(@Param('id') id: string, @CurrentUser() teacher: User) {
    await this.homeworkService.delete(id, teacher);
    return success(null, '删除成功');
  }
}
