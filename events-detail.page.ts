import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../environments/environment';
import * as moment from 'moment';
import {Platform, ToastController} from '@ionic/angular';
import {GoogleMap, GoogleMaps, GoogleMapsAnimation, LatLng, Marker} from '@ionic-native/google-maps';
import {Location} from '@angular/common';
import {EventsStore} from '../events.store';
import {Event} from '../../interfaces/event.interface';
import {EventsService} from '../events.service';
import { Source } from 'webpack-sources';

@Component({
    selector: 'app-events-detail',
    templateUrl: './events-detail.page.html',
    styleUrls: ['./events-detail.page.scss'],
})
export class EventsDetailPage implements OnInit {

    environment = environment;
    event: Event;
    map: GoogleMap;
    events: Event[] = [];

    constructor(private activatedRoute: ActivatedRoute,
                private eventsStore: EventsStore,
                private platform: Platform,
                private toastCtrl: ToastController,
                private location: Location,
                private eventService: EventsService) {
    }

    ngOnInit() {


            this.platform.ready();
//         const a=this.activatedRoute.params.subscribe(params => params['source.destination._value.event.id]']);
// console.log(a);
            this.activatedRoute.params.subscribe(params => {
            if ( params.id == 1) {
    this.eventService.getById(params.id).subscribe(event => {
        this.event = event;
        this.eventService.nextFiveEvents(this.event.id, this.event.venue.id, this.event.instanceDate)
            .subscribe(events => {
                this.events = events;
            });
        this.loadMap();
    });
}

            this.eventsStore.events.subscribe(days => {
                const eventDay = days.find(day => {
                    return moment(day.date).isSame(moment(params.date), 'day');
                });
                if (!eventDay) {
                    this.eventService.getById(params.id).subscribe(event => {
                        this.event = event;
                        this.eventService.nextFiveEvents(this.event.id, this.event.venue.id, this.event.instanceDate)
                            .subscribe(events => {
                                this.events = events;
                            });
                        this.loadMap();
                    });
                } else {
                    this.event = eventDay.events.find(event => {
                        return event.id === Number(params.id);
                    });
                    this.eventService.nextFiveEvents(this.event.id, this.event.venue.id, this.event.instanceDate)
                        .subscribe(events => {
                            this.events = events;
                        });
                    this.loadMap();
                }
            });
        });


    }

    loadMap() {
   
        const location = new LatLng(this.event.venue.latitude, this.event.venue.longitude);

        this.map = GoogleMaps.create('map_canvas', {
            camera: {
                target: location,
                zoom: 18,
                tilt: 0,
            },
        });

        const marker: Marker = this.map.addMarkerSync({
            title: this.event.name,
            snippet: this.event.strapline,
            position: location,
            animation: GoogleMapsAnimation.DROP
            // animation: GoogleMapsAnimation.BOUNCE
        });
   
  
    }


    getPrice() {

        if (this.event.ticketPrice) {
            return this.event.ticketPrice;
        } else {
            return this.event.venue.averagePrice;
        }

    }

    getPriceIcon() {
        if (this.event.ticketPrice) {
            return 'ticket';
        } else {
            return 'pub';
        }
    }

    getTime() {
        return `${this.event.startTime.substr(0, 5)} -  ${this.event.endTime.substr(0, 5)}`;
    }

    back() {
        this.location.back();
    }
}
