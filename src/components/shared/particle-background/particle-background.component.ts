import {
  Component,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

declare var THREE: any;

@Component({
  selector: 'app-particle-background',
  standalone: true,
  template: `<div #container class="absolute inset-0"></div>`,
  styles: `
    :host {
      display: block;
      z-index: -1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticleBackgroundComponent implements AfterViewInit, OnDestroy {
  container = viewChild<ElementRef>('container');

  private scene: any;
  private camera: any;
  private renderer: any;
  private particles: any;
  private mouseX = 0;
  private mouseY = 0;
  private windowHalfX = window.innerWidth / 2;
  private windowHalfY = window.innerHeight / 2;
  private animationFrameId: number | null = null;

  ngAfterViewInit() {
    this.init();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    // Clean up Three.js resources
    this.renderer?.dispose();
    this.particles?.geometry.dispose();
    this.particles?.material.dispose();
  }

  private init() {
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.z = 1000;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0d1117, 0.001);

    // Particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const numParticles = 20000;

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;
      vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0x484f58, // gray-600
      size: 2,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    containerEl.appendChild(this.renderer.domElement);

    // Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }

  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  private render() {
    const time = Date.now() * 0.00005;

    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    const h = (360 * (1.0 + time) % 360) / 360;
    // this.particles.material.color.setHSL(h, 0.5, 0.5); // Uncomment for rainbow effect

    this.renderer.render(this.scene, this.camera);
  }
}
