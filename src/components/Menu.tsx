import {  IonButton, IonCheckbox, IonContent, IonIcon,  IonItem, IonLabel,  IonList,  IonListHeader,  IonMenu,  IonMenuToggle,  IonNote, IonSearchbar} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { addOutline, archiveOutline, archiveSharp, bookmarkOutline, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline
  , paperPlaneSharp, trashOutline, trashSharp
    , warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { Services } from './Function';
import { socket, Store } from './Store';
import userEvent from '@testing-library/user-event';
import { isJsxFragment } from 'typescript';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Inbox',
    url: '/page/Inbox',
    iosIcon: mailOutline,
    mdIcon: mailSharp
  },
  {
    title: 'Outbox',
    url: '/page/Outbox',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp
  },
  {
    title: 'Favorites',
    url: '/page/Favorites',
    iosIcon: heartOutline,
    mdIcon: heartSharp
  },
  {
    title: 'Archived',
    url: '/page/Archived',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp
  },
  {
    title: 'Trash',
    url: '/page/Trash',
    iosIcon: trashOutline,
    mdIcon: trashSharp
  },
  {
    title: 'Spam',
    url: '/page/Spam',
    iosIcon: warningOutline,
    mdIcon: warningSharp
  }
];

var txt = "";
const Menu: React.FC = () => {
  const [info, setInfo] = useState<any>()
  const [usr, setUsr] = useState<any>([])
  
  const hist = useHistory();

  Store.subscribe({num: 0, type: "services", func: ()=>{
    setInfo(Store.getState().services);
  }})
  Store.subscribe({num: 1, type: "users", func: ()=>{
    setUsr(Store.getState().users)
  }})

  function getFranch(){
    let jarr: any;jarr =[];
    for(let i = 0;i < usr.length;i++){
      if(usr[i].checked)
        jarr = [...jarr, usr[i].id]
    }
    return jarr;
  }

  function updInfo(){
    socket.once("method_service_tree", (data)=>{
       Store.dispatch({type: "services", services: data[0][0].json === null ? [] : data[0][0].json})
    })
    socket.emit("method", {
      method: "service_tree", 
      param:  txt,
      franch: getFranch()
    })    
  }

  function Usr():JSX.Element {
    let elem = <></>
    for(let i = 0;i < usr.length;i++){
      let label = usr[i];
        elem = <>
          { elem }
          <IonItem lines="none" key={ i }>
            <IonCheckbox slot="start" checked = { label.checked } onIonChange={()=>{
              label.checked = !label.checked
              updInfo();
            }}/>
            <IonLabel>{label.fio}</IonLabel>
          </IonItem>
        </>
      }
    return elem;
  }

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Inbox</IonListHeader>
          <IonNote>hi@ionicframework.com</IonNote>
          <IonItem>
            <IonSearchbar debounce={ 500 } onIonChange={(e)=>{
              txt = e.detail.value as string
              updInfo();
            }}/>
            <IonButton fill="clear" slot = "end" onClick={()=>{
              hist.push("/page/Service"); 
            }}>
              <IonIcon icon = { addOutline } slot="icon-only" />
            </IonButton>
          </IonItem>
          <IonList 
             id="labels-list"
          >
            <IonListHeader>Сервисы</IonListHeader>
            <Services info= { info }  />
          </IonList>
        </IonList>

        <IonList id="labels-list">
          <IonListHeader>Франчайзеры</IonListHeader>
          <Usr />
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
