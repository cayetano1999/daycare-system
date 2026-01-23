// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';
import { environment } from 'src/environments/environment';

export interface UploadOptions {
  bucket?: string;             // default: environment.storageBucket
  folder?: string;             // default: 'users'
  userId?: string;             // para estructurar rutas
  filename?: string;           // si quieres forzar un nombre
  toWebp?: boolean;            // convertir a webp
  maxSizeMB?: number;          // compresión
  maxWidthOrHeight?: number;   // compresión
  quality?: number;            // 0..1
  upsert?: boolean;            // default: true
}

export interface UploadResult {
  path: string;
  url: string;     // pública
  mime: string;
  size: number;    // bytes
}

@Injectable({ providedIn: 'root' })
export class SupabaseStorageService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://cchztsiivmddznqtevrw.supabase.co';
    const supabaseKey = 'sb_publishable_LcCBe5kNxddZYO3JVseRHw_TYeCJ7BU';
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  getSupabase() {
    return this.client;
  }



  async compressImage(file: File, opts?: Partial<UploadOptions>): Promise<File> {
    const toWebp = !!opts?.toWebp;
    const options = {
      maxSizeMB: opts?.maxSizeMB ?? 0.6,
      maxWidthOrHeight: opts?.maxWidthOrHeight ?? 1000,
      useWebWorker: true,
      fileType: (toWebp ? 'image/webp' : (file.type || 'image/jpeg')) as
        | 'image/webp'
        | 'image/jpeg'
        | 'image/png',
      quality: opts?.quality ?? 0.8,
    };
    return imageCompression(file, options);
  }

  private uid() {
    return (crypto as any).randomUUID?.() || Math.random().toString(36).slice(2);
  }

  async uploadImage(file: File, opts?: UploadOptions): Promise<UploadResult> {

    console
.log('Uploading image with options:', opts);
    const bucket = opts?.bucket ?? 'festiva';
    const folder = opts?.folder ?? 'users';
    const userId = opts?.userId ?? 'anonymous';
    const upsert = opts?.upsert ?? true;

    // compresión
    const compressed = await this.compressImage(file, opts);
    const ext = (compressed.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const name = `${Date.now()}-${this.uid()}.${ext}`;
    const path = `${folder}/${name}`;

    const { error: upErr } = await this.client.storage
      .from(bucket)
      .upload(path, compressed, {
        cacheControl: '31536000', // 1 año
        contentType: compressed.type,
        upsert,
      });

    if (upErr) throw upErr;

    // bucket público => URL inmediata
    const { data: pub } = this.client.storage.from(bucket).getPublicUrl(path);
    return {
      path,
      url: pub.publicUrl,
      mime: compressed.type,
      size: compressed.size,
    };
  }

  async removeImage(path: string, bucket?: string) {
    if (!path) return;
    const b = bucket ?? 'festiva';
    await this.client.storage.from(b).remove([path]);
  }

  // Migrar base64 → Storage (por si necesitas)
  async uploadBase64(base64: string, opts?: UploadOptions): Promise<UploadResult> {
    const b = base64.split(',')[1] || base64;
    const mimeMatch = base64.match(/^data:(.*?);base64,/);
    const mime = mimeMatch?.[1] ?? 'image/jpeg';
    const blob = new Blob([Uint8Array.from(atob(b), c => c.charCodeAt(0))], { type: mime });
    const file = new File([blob], `from-base64.${mime.split('/')[1] || 'jpg'}`, { type: mime });
    return this.uploadImage(file, opts);
  }

  async uploadDocument(
    file: File,
    opts?: UploadOptions
  ): Promise<UploadResult> {

    const bucket = opts?.bucket ?? 'babyhouse';
    const folder = opts?.folder ?? 'documents';
    const userId = opts?.userId ?? 'anonymous';
    const upsert = opts?.upsert ?? true;

    const ext = file.name.split('.').pop();
    const name = opts?.filename ?? `${Date.now()}-${this.uid()}.${ext}`;
    const path = `${folder}/${name}`;

    const { error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert
      });

    if (error) throw error;

    return {
      path,
      url: '', // ❌ NO pública
      mime: file.type,
      size: file.size
    };
  }

  async getSignedUrl(
    path: string,
    bucket = 'babyhouse',
    expiresIn = 60 * 5 // 5 minutos
  ): Promise<string> {

    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }


}
