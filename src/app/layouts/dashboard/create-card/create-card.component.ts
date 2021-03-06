import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CloudinaryService } from './../../../shared/services/cloudinary.service';
import { BoardService } from './../services/board.service';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
declare const $: any;

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss']
})
export class CreateCardComponent implements OnInit {
  searchValue = '';
  searchLoading = false;
  activateNav = '';
  viewType: 'default' | 'online' | 'upload' = 'default';
  selectedMedia: string | undefined;
  message = '';
  data = {gifs: null, images: null};
  boardId!: string;
  submitted = false;
  loading = false;
  name = {firstName: '', lastName: ''};
  cardDetail = {_id: '', mediaType: '', mediaUrl: '', postContent: '', creatorName: '' , loading: false};
  showEmojiPicker = false;

  constructor(
    route: ActivatedRoute,
    public domSanitizer: DomSanitizer,
    private boardSrv: BoardService,
    private toastr: ToastrService,
    private cloudinarySrv: CloudinaryService,
    private router: Router,
    public location: Location) {
      this.boardId = route.snapshot.params.id;
      this.cardDetail._id = route.snapshot.queryParams.cardId;
    }

  ngOnInit(): void {
    this.getBoard();
  }

  hideEmojiPicker(): void {
    setTimeout(() => {
      $(window).click(() => {
        this.showEmojiPicker = false;
        });
      $('#emoji-picker-container').click((event: any) => {
          this.showEmojiPicker = true;
          event.stopPropagation();
      });
      $('#emoji-picker-handler').click((event: any) => {
        this.showEmojiPicker = true;
        event.stopPropagation();
      });
    }, 1);
  }
  toggleEmojiPicker(cond: boolean): void {
    this.showEmojiPicker = cond;
  }

  searchGiphy(): void {
    this.searchLoading = true;
    this.data.gifs = null;
    this.boardSrv.giphySearch(this.searchValue).subscribe(res => {
      this.data.gifs = res.data;
    }).add(() => this.searchLoading = false);
  }
  getBoard(): void {
    this.boardSrv.getBoard(this.boardId).subscribe(res => {
      const { cards } = res.payload[0];
      if (this.cardDetail._id) {
        this.cardDetail = cards.find((card: any) => card._id === this.cardDetail._id);
        this.fillCard();
      }
      this.hideEmojiPicker();
    });
  }
  fillCard(): void {
    if (this.cardDetail) {
      this.message = this.cardDetail.postContent;
      this.selectedMedia = this.cardDetail.mediaUrl;
      this.activateNav = this.cardDetail.mediaType;
      this.name.firstName = this.cardDetail.creatorName;
      this.cardDetail.loading = true;
    }
  }
  saerchUnslash(): void {
    this.searchLoading = true;
    this.data.images = null;
    this.boardSrv.unsplashSearch(this.searchValue).subscribe(res => {
      this.data.images = res.results;
    }).add(() => this.searchLoading = false);
  }
  showNav = (nav: string) => {
    if (this.selectedMedia) {return; }
    this.data = {gifs: null, images: null};
    this.viewType = 'default';
    this.activateNav = nav;
    this.searchValue = '';
  }
  changeView(viewType: any): void {
    this.viewType = viewType;
  }
  selectMedia(media: any): void {
    this.selectedMedia = media;
  }
  readURL(input: any, id = 'imgIDSelector'): void {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        document.getElementById(id)?.setAttribute('src', e.target?.result);
      };
      reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
  }
  browseFile(id: string): void {
    document.getElementById(id)?.click();
  }
  uploadImage(event: Event): void {
    this.selectedMedia = (event.target as any).files[0];
    this.readURL(event.target);
  }
  uploadVideo(event: any): void {
    const blobURL = URL.createObjectURL(event.target?.files[0]);
    this.selectedMedia = event.target?.files[0];
    this.readURL(event.target, 'videoIDSelector');
    // document.getElementById('videoIDSelector')?.setAttribute('src', blobURL);
  }
  createCard(): void {
    this.submitted = true;
    if (this.isFormValid && this.name.firstName) {
      this.loading = true;
      const file: any = this.selectedMedia || '';
      const fd = new FormData();
      fd.append('postContent', this.message);
      fd.append('mediaType', this.activateNav);
      fd.append('creatorName', this.name.firstName);
      if (this.viewType === 'upload') {
        fd.append('mediaFile', file);
      } else {
        fd.append('mediaUrl', file);
      }
      if (this.cardDetail._id) {
        fd.append('cardId', this.cardDetail._id);
      }
      const obs: Observable<any> = this.cardDetail._id ?
      this.boardSrv.updateCard(this.boardId, fd) : this.boardSrv.createCard(this.boardId, fd);
      obs.subscribe(() => {
        const text = this.cardDetail._id ? 'updated' : 'created';
        this.toastr.success(`Card ${text} successfully`);
        this.goBack();
      }, err => {
        this.toastr.error(err.message);
      }).add(() => this.loading = false);
    }
  }
  get isFormValid(): any {
  return (this.message || this.selectedMedia);
  }
  addYoutubeUrl(): void {
    if (this.validateYouTubeUrl(this.searchValue)) {
       this.selectedMedia = this.searchValue;
    } else {
      this.toastr.error('Invalid youtube url');
    }
  }
  validateYouTubeUrl(urlToParse: string): boolean{
    if (urlToParse) {
        const regExp = /^https:\/\/(?:www\.)?youtube.com\/[A-z0-9]/;
        if (urlToParse.match(regExp)) {
            return true;
        }
    }
    return false;
  }
  getYoutubeEmbedUrl(youtubeUrl: string): string {
    let url = youtubeUrl;
    if (youtubeUrl.includes('watch')) {
      const hashUrl = youtubeUrl.split('v=')[1];
      url = `https://www.youtube.com/embed/${hashUrl}`;
    }
    return url;
  }
  goBack(): void {
    this.router.navigate(['/boards', this.boardId]);
  }
  addEmoji(event: any): void {
    const emoji = event.emoji.native;
    this.message = `${this.message} ${emoji}`;
  }



}
