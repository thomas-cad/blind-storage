"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
let StorageService = class StorageService {
    constructor() {
        this.dir = (0, path_1.join)(process.cwd(), 'uploads');
    }
    async save(file) {
        await fs_1.promises.mkdir(this.dir, { recursive: true });
        let name = (0, crypto_1.randomUUID)() + '-file.json'; // fallback name
        try {
            const encryptedData = JSON.parse(file.buffer.toString());
            if (encryptedData.originalName) {
                // Use the original filename with a short hash prefix to avoid collisions
                const hash = (0, crypto_1.randomUUID)().substring(0, 8);
                name = hash + '-' + encryptedData.originalName;
            }
        }
        catch (e) {
            // If parsing fails, use the fallback name
        }
        await fs_1.promises.writeFile((0, path_1.join)(this.dir, name), file.buffer);
        return name;
    }
    async list() {
        await fs_1.promises.mkdir(this.dir, { recursive: true });
        return fs_1.promises.readdir(this.dir);
    }
    async get(name) {
        return fs_1.promises.readFile((0, path_1.join)(this.dir, name));
    }
    async delete(name) {
        await fs_1.promises.unlink((0, path_1.join)(this.dir, name));
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
