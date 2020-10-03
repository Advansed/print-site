import {  IonButton, IonCheckbox, IonContent, IonIcon,  IonItem, IonLabel,  IonList,  IonListHeader,  IonMenu,  IonMenuToggle,  IonNote, IonSearchbar} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { addOutline, archiveOutline, archiveSharp, bookmarkOutline, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline
  , paperPlaneSharp, trashOutline, trashSharp
    , warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { Services } from './Function';
import { socket, Store } from './Store';

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

const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

const Menu: React.FC = () => {
  const [info, setInfo] = useState<any>()
  const location = useLocation();
  const hist = useHistory();

  useEffect(()=>{
    console.log("useEffect")
    setInfo(Store.getState().services)
  }, [])

  Store.subscribe({num: 1, type: "services", func: ()=>{
    setInfo(Store.getState().services);
    console.log("services")
  }})

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Inbox</IonListHeader>
          <IonNote>hi@ionicframework.com</IonNote>
          <IonItem>
            <IonSearchbar debounce={ 500 } onIonChange={(e)=>{
              console.log(e.detail.value)
              let param = e.detail.value
                socket.once("method", (data)=>{
                    Store.dispatch({type: "services", services: data[0][0].json})
                })
                socket.emit("method", {method: "service_tree", param: param})
            }}/>
            <IonButton fill="clear" slot = "end" onClick={()=>{
              hist.push("/page/Service"); 
            }}>
              <IonIcon icon = { addOutline } slot="icon-only" />
            </IonButton>
          </IonItem>
          <IonList onClick={(e) => {
              hist.push("/page/Services");
          }}>
            <Services info= { info }  />
          </IonList>
        </IonList>

        <IonList id="labels-list">
          <IonListHeader>Labels</IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
