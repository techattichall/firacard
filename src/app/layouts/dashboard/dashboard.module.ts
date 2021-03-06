import { SharedModule } from './../../shared/shared.module';
import { BoardService } from './services/board.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashHomeComponent } from './dash-home/dash-home.component';
import { DashFooterComponent } from './dash-footer/dash-footer.component';
import { BoardComponent } from './board/board.component';
import { DashLayoutComponent } from './dash-layout/dash-layout.component';
import { CreateCardComponent } from './create-card/create-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoardSettingsComponent } from './board/board-settings/board-settings.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateBoardComponent } from './board/create-board/create-board.component';
import { SendBoardComponent } from './board/send-board/send-board.component';
import { UpgradeBoardComponent } from './board/upgrade-board/upgrade-board.component';


@NgModule({
  declarations: [
    DashHomeComponent, DashFooterComponent, BoardComponent, DashLayoutComponent,
    CreateCardComponent, BoardSettingsComponent, ProfileComponent, CreateBoardComponent,
    SendBoardComponent, UpgradeBoardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PickerModule,
    DragDropModule
  ],
  providers: [BoardService]
})
export class DashboardModule { }
