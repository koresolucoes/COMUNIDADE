import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { VirtualFileSystemService } from '../../../services/virtual-file-system.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-system-explorer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-system-explorer.component.html',
  styleUrls: ['./file-system-explorer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSystemExplorerComponent {
  vfs = inject(VirtualFileSystemService);

  fileList = computed(() => this.vfs.listDir());
  selectedPath = this.vfs.selectedFile;

  selectedFileContent = computed(() => {
    const path = this.selectedPath();
    if (path) {
      try {
        return this.vfs.readFile(path);
      } catch {
        return `// Erro ao ler o arquivo ${path}`;
      }
    }
    return '// Selecione um arquivo para ver seu conteúdo.';
  });

  onFileClick(path: string) {
    this.vfs.selectFile(path);
  }
}
