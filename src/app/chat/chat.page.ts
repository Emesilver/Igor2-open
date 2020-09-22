import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { User } from '../models/user';
import { UserProvider } from '../services/user/user';
import * as firebase from 'firebase/app';
import 'firebase/database';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent, {static: false}) content: IonContent;
  user: User;
  messageData = {type: '', nickname: '', message: ''};
  companyName: string;
  nickname: string;
  offStatus = false;

  chats = [];

  constructor(
    private userProvider: UserProvider
  ) {
    this.messageData.message = '';
   }

  async ngOnInit() {
    await this.init();
  }

  async init() {
    this.user = await this.userProvider.getUserLocal();
    this.nickname = this.user.currentCompany.nomeOper;
    this.companyName = this.user.currentCompany.fantasiaEmp;
    this.messageData.type = 'message';
    this.messageData.nickname = this.nickname;
    firebase.database().ref('rooms/' + this.companyName + '/' + 'messages').on('value', resp => {
      this.chats = [];
      this.chats = snapshotToArray(resp);
      setTimeout(() => {
        if (this.content) {
          this.content.scrollToBottom(300);
        }
        if (this.offStatus === false) {
          // this.content.scrollToBottom(300);
        }
      }, 1000);
    });

    // Adicionar a rooms-info para esta empresa
    const roomInfo = firebase.database().ref('rooms-info/' + this.companyName);
    roomInfo.set({
      companyName: this.companyName,
      lastAccess: this.nickname,
      lastAccessDate: Date()
    });
  }

  ionViewWillEnter() {
    this.init();
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  sendMessage() {
    if (this.messageData.message !== '') {
      const messageNode = firebase.database().ref('rooms/' + this.companyName + '/' + 'messages').push();
      messageNode.set({
        type: this.messageData.type,
        user: this.messageData.nickname,
        message: this.messageData.message,
        sendDate: Date()
      });
      this.messageData.message = '';
    }

  }

}

export const snapshotToArray = snapshot => {
  const returnArr = [];
  snapshot.forEach(childSnapshot => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr;
};
