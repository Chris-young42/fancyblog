import { ApiProperty } from '@nestjs/swagger';

export class HeaderNavEntity {
  @ApiProperty({ description: '导航项ID' })
  id: number;

  @ApiProperty({ description: '导航标签' })
  label: string;

  @ApiProperty({ description: '导航路径' })
  path: string;

  @ApiProperty({ description: '关联分类', required: false })
  category?: string;

  @ApiProperty({ description: '排序权重' })
  order: number;

  @ApiProperty({ description: '是否启用' })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class HeaderListResponseEntity {
  @ApiProperty({ description: '导航项列表', type: [HeaderNavEntity] })
  data: HeaderNavEntity[];

  @ApiProperty({ description: '总数' })
  total: number;

  @ApiProperty({ description: '当前页' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}
