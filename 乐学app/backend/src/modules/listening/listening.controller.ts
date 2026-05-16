import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListeningService } from './listening.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { SubmitPracticeDto } from './dto/submit-practice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { success } from '../../common/utils/response.util';
import { User } from '../user/user.entity';
import { MaterialCategory, ListeningLevel } from './listening-material.entity';
import { PracticeStatus } from './listening-practice.entity';

@ApiTags('听力模块')
@Controller('listening')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ListeningController {
  constructor(private readonly listeningService: ListeningService) {}

  @Post('materials')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '上传听力材料' })
  async createMaterial(
    @Body() createMaterialDto: CreateMaterialDto,
    @CurrentUser() teacher: User,
  ) {
    const material = await this.listeningService.createMaterial(createMaterialDto, teacher);
    return success(material, '材料上传成功');
  }

  @Get('materials')
  @ApiOperation({ summary: '获取听力材料列表' })
  async getAllMaterials(
    @Query('category') category?: MaterialCategory,
    @Query('level') level?: ListeningLevel,
    @Query('isPublic') isPublic?: boolean,
  ) {
    const materials = await this.listeningService.getAllMaterials(category, level, isPublic);
    return success(materials);
  }

  @Get('materials/:id')
  @ApiOperation({ summary: '获取听力材料详情' })
  async getMaterial(@Param('id') id: string) {
    const material = await this.listeningService.getMaterialById(id);
    return success(material);
  }

  @Delete('materials/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '删除听力材料' })
  async deleteMaterial(@Param('id') id: string, @CurrentUser() teacher: User) {
    await this.listeningService.deleteMaterial(id, teacher);
    return success(null, '删除成功');
  }

  @Post('materials/:id/practice')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: '开始听力练习' })
  async startPractice(
    @Param('id') materialId: string,
    @CurrentUser() student: User,
  ) {
    const practice = await this.listeningService.startPractice(materialId, student);
    return success(practice, '开始练习');
  }

  @Post('practices/:id/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: '提交听力练习' })
  async submitPractice(
    @Param('id') practiceId: string,
    @CurrentUser() student: User,
    @Body() submitDto: SubmitPracticeDto,
  ) {
    const practice = await this.listeningService.submitPractice(practiceId, submitDto, student);
    return success(practice, '提交成功');
  }

  @Get('practices/my')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: '学生获取自己的听力练习记录' })
  async getMyPractices(
    @CurrentUser() student: User,
    @Query('status') status?: PracticeStatus,
  ) {
    const practices = await this.listeningService.getStudentPractices(student.id, status);
    return success(practices);
  }

  @Get('practices/:id')
  @ApiOperation({ summary: '获取练习记录详情' })
  async getPractice(@Param('id') id: string) {
    const practice = await this.listeningService.getPracticeById(id);
    return success(practice);
  }

  @Get('materials/:id/practices')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '获取某材料的所有练习记录' })
  async getMaterialPractices(@Param('id') materialId: string) {
    const practices = await this.listeningService.getMaterialPractices(materialId);
    return success(practices);
  }
}
