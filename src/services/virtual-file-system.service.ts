import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VirtualFileSystemService {
  // path -> content
  files = signal<Record<string, string>>({});
  selectedFile = signal<string | null>(null);

  initialize(initialFiles: Record<string, string>) {
    this.files.set(initialFiles);
    this.selectedFile.set(null);
  }

  readFile(path: string): string {
    const currentFiles = this.files();
    if (path in currentFiles) {
      return currentFiles[path];
    }
    throw new Error(`FileNotFoundError: [Errno 2] No such file or directory: '${path}'`);
  }

  writeFile(path: string, content: string): void {
    this.files.update(currentFiles => ({
      ...currentFiles,
      [path]: content
    }));
  }

  appendFile(path: string, content: string): void {
    this.files.update(currentFiles => {
      const newContent = (currentFiles[path] || '') + content;
      return { ...currentFiles, [path]: newContent };
    });
  }

  fileExists(path: string): boolean {
    return path in this.files();
  }

  listDir(path: string = '/'): string[] {
    // Simple implementation: returns all files for now.
    // A more complex one would handle paths.
    return Object.keys(this.files());
  }

  selectFile(path: string | null) {
    this.selectedFile.set(path);
  }
}
