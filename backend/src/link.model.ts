import { Table, Column, Model, DataType } from 'sequelize-typescript';

interface LinkAttributes {
  id?: number;
  original_url: string;
  short_url: string;
}

@Table({ tableName: 'links', timestamps: false })
export class Link extends Model<LinkAttributes> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  original_url: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  short_url: string;
}
