import { BoardService } from './../services/board.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var $: any;


@Component({
  selector: 'app-dash-home',
  templateUrl: './dash-home.component.html',
  styleUrls: ['./dash-home.component.scss']
})
export class DashHomeComponent implements OnInit {
  boards!: any[];
  reminders!: any[];
  activeTab = 'curratedCards';
  form = this.fb.group({
    boardTitle: ['', [Validators.required]],
    recipients: this.fb.array([this.createRecp()])
  });
  reminderForm = this.fb.group({
    reminderName: [''],
    eventTitle: [''],
    eventDate: ['']
  });
  loading = false;

  get recpForm(): FormArray {return this.form.get('recipients') as FormArray; }
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private boardSrv: BoardService) { }

  ngOnInit(): void {
    $('[data-toggle="tooltip"]').tooltip();
    this.route.fragment.subscribe(tab => {
      this.activeTab = tab || this.activeTab;
    });
    this.getBoards();
    this.getReminders();
  }
  getBoards(): void {
    this.boardSrv.getUserBoards().subscribe(res => {
      this.boards = res.payload;
    });
  }
  getReminders(): void {
    this.boardSrv.getReminders().subscribe(res => {
      this.reminders = res.payload;
    });
  }
  get getRecpControls(): any[] {
    return ((this.form.get('recipients') as any).controls);
  }
  createRecp(): FormGroup {
    return this.fb.group({
      name: ['']
    });
  }
  addRecp(): void {
    this.recpForm.push(this.createRecp());
  }
  removeRecp(i: any): void {
    this.recpForm.removeAt(i);
  }

  createBoard(): void {
    if (this.form.valid) {
      const payload = {boardTitle: this.form.value.boardTitle};
      this.loading = true;
      this.boardSrv.createBoard(payload).subscribe(res => {
        this.toastr.success('Board created successfully');
        this.getBoards();
        (document.querySelector('.close') as any).click();
      }, err => {
        this.toastr.error('create board error');
      }).add(() => this.loading = false);
    }
  }
  getBoardImg(board: any): string {
    const boardImg = board.cards.find((card: any) => card.mediaUrl && (card.mediaType === 'gif' || card.mediaType === 'image'));
    return boardImg && boardImg.mediaUrl;
  }

  createReminder(): void {
    this.loading = true;
    this.boardSrv.createReminder(this.reminderForm.value).subscribe(() => {
      this.reminderForm.reset();
      this.toastr.success('Reminder created successfully');
      this.getReminders();
      (document.querySelector('#reminderModal .close') as any).click();
    }, err => {
      this.toastr.success('create reminder error');
    }).add(() => this.loading = false);
  }
  get pageLoading(): any {
    return this.boards && this.reminders;
  }
}
