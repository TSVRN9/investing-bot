"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticker = void 0;
const typeorm_1 = require("typeorm");
let Ticker = class Ticker extends typeorm_1.BaseEntity {
};
exports.Ticker = Ticker;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ticker.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "company_name" }),
    __metadata("design:type", String)
], Ticker.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ticker.prototype, "ticker", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ticker.prototype, "exchange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "gics_sector" }),
    __metadata("design:type", String)
], Ticker.prototype, "gicsSector", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "gics_industry_group" }),
    __metadata("design:type", String)
], Ticker.prototype, "gicsIndustryGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "gics_industry" }),
    __metadata("design:type", String)
], Ticker.prototype, "gicsIndustry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "gics_sub_industry" }),
    __metadata("design:type", String)
], Ticker.prototype, "gicsSubIndustry", void 0);
exports.Ticker = Ticker = __decorate([
    (0, typeorm_1.Entity)()
], Ticker);
