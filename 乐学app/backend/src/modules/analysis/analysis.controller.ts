import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { success } from '../../common/utils/response.util';
import { User } from '../user/user.entity';

@ApiTags('学习分析')
@Controller('analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('student/:studentId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '获取学生详细分析报告' })
  async getStudentAnalysis(@Param('studentId') studentId: string) {
    const analysis = await this.analysisService.getStudentAnalysis(studentId);
    return success(analysis);
  }

  @Get('my')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: '学生获取自己的学习分析报告' })
  async getMyAnalysis(@CurrentUser() student: User) {
    const analysis = await this.analysisService.getStudentAnalysis(student.id);
    return success(analysis);
  }

  @Get('class')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '获取班级整体分析报告' })
  async getClassAnalysis(@CurrentUser() teacher: User) {
    const analysis = await this.analysisService.getClassAnalysis(teacher.id);
    return success(analysis);
  }
}
