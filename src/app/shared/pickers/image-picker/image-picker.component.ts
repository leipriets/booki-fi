import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
  standalone: false,
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker') filePicker: ElementRef<HTMLInputElement> | undefined;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false; 
  selectedImage?: string;
  usePicker = false;

  constructor(private platform: Platform) {}

  ngOnInit() {
    console.log('Mobile:', this.platform.is('mobile'));
    console.log('Hybrid:', this.platform.is('hybrid'));
    console.log('iOS:', this.platform.is('ios'));
    console.log('Android:', this.platform.is('android'));
    console.log('Desktop:', this.platform.is('desktop'));

    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      this.usePicker = true;
    }

    console.log('Use Picker:', this.usePicker);
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker?.nativeElement.click();
      return;
    }

    Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // or CameraSource.Photos for gallery
      correctOrientation: true,
      height: 320,
      width: 600,
    })
      .then((image) => {
        this.selectedImage = image.dataUrl;
        this.imagePick.emit(this.selectedImage);
      })
      .catch((error) => {

        if (this.usePicker) {
          this.filePicker?.nativeElement.click();
        }

        console.error('Error taking picture', error);
        return false;
        // Handle the error, e.g., show an alert to the user
      });
  }

  onFileChosen(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.files) {
      const pickedFile = target.files[0];
      if (!pickedFile) {
        return;
      } 

      const fr = new FileReader();
      fr.onload = () => {
        const dataUrl = fr.result as string;
        this.selectedImage = dataUrl;
        this.imagePick.emit(pickedFile);  
      }
      fr.readAsDataURL(pickedFile);
    }
  }
}
