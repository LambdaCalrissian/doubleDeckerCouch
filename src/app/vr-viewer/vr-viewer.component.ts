import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vr-viewer',
  templateUrl: './vr-viewer.component.html',
  styleUrls: ['./vr-viewer.component.css']
})
export class VrViewerComponent implements OnInit {
  aVideo: any;
  video: any;

  constructor(
  ) { }

  ngOnInit() {
    this.aVideo = document.querySelector('#aVideo');
    this.video = document.querySelector('#video') as HTMLVideoElement;
    this.video.addEventListener('loadedmetadata', (ev) => {
      this.aVideo.setAttribute('height', this.video.videoHeight);
      this.aVideo.setAttribute('width', this.video.videoWidth);
    }, {once: true});
  }
}
