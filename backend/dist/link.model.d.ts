import { Model } from 'sequelize-typescript';
interface LinkAttributes {
    id?: number;
    original_url: string;
    short_url: string;
}
export declare class Link extends Model<LinkAttributes> {
    original_url: string;
    short_url: string;
}
export {};
