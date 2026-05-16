import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { success } from '../../common/utils/response.util';
import { User } from './user.entity';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建用户（管理员）' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return success(user, '创建成功');
  }

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '获取用户列表' })
  async findAll(@Param('role') role?: UserRole) {
    const users = await this.userService.findAll(role);
    return success(users);
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser() user: User) {
    const userInfo = await this.userService.findOne(user.id);
    return success(userInfo);
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: '获取单个用户信息' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return success(user);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新当前用户信息' })
  async updateProfile(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(user.id, updateUserDto);
    return success(updatedUser, '更新成功');
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户信息（管理员）' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return success(updatedUser, '更新成功');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除用户（管理员）' })
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return success(null, '删除成功');
  }

  @Post('change-password')
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    await this.userService.updatePassword(user.id, body.oldPassword, body.newPassword);
    return success(null, '密码修改成功');
  }
}
