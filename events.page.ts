import {Component, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import {Event} from '../interfaces/event.interface';
import {Tag} from '../interfaces/tag.interface';
import {Category} from '../interfaces/category.interface';
import {VenueType} from '../enums/venue-type.enum';
import {IonContent, IonInfiniteScroll} from '@ionic/angular';
import * as _ from 'lodash';
import {EventsStore} from './events.store';
import {DaysEvents} from '../interfaces/days-event.interface';


@Component({
    selector: 'app-events',
    templateUrl: './events.page.html',
    styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
    // calendar controls
    dateSelected: Date;
    dateLoaded: Date;
    showCalendar = false;
    calendarStart: Date;
    calendarMaximum: any;

    datePipeSettings = {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        // sameElse: 'dddd Do MMMM YYYY',
        sameElse: 'dddd Do MMMM',
    };
    @ViewChild('content', {static: false})
    content: IonContent;
    @ViewChild('scroll', {static: false})
    scroll: IonInfiniteScroll;

    // filters
    eventTypes = [];
    eventTypeEnum = VenueType;
    showFilters = false;
    selectedTags: Tag[] = [];
    tags: Tag[] = [];
    selectedCategories: Category[] = [];
    categories: Category[] = [];

    // data
    events: DaysEvents[] = [];
    constructor(private eventsStore: EventsStore) {
    }

    ngOnInit() {
        this.eventsStore.events.subscribe(events => {
            this.events = events;
           // console.log(this.events.length);
        });
        this.dateSelected = moment().toDate();
        // this.dateSelected = new Date(1546228200 * 1000) ;
        this.dateLoaded = moment().toDate();
        this.calendarStart = moment().subtract(30, 'years').toDate();
        this.getResults(this.dateSelected, true, true);
 }
    getTypeButtonColor(types) {
        if (types === null && this.eventTypes.length === 0) {
            return 'primary';
        } else if (_.includes(this.eventTypes, types)) {
            return 'primary';
        } else {
            return 'medium';
        }
    }


    toggleType(selectedType: VenueType) {


       if (selectedType === null) {
            if (this.eventTypes === []) {
                this.eventTypes.push(this.eventTypeEnum.CLUB);
                this.eventTypes.push(this.eventTypeEnum.PUB);
                this.eventTypes.push(this.eventTypeEnum.BAR);
            } else {
                this.eventTypes = [];
            }
        } else if (_.includes(this.eventTypes, selectedType)) {
            _.pull(this.eventTypes, selectedType);
        } else {
            this.eventTypes.push(selectedType);
        }
       this.toggleFilters();
    }

    toggleCalendar() {

        this.showCalendar = !this.showCalendar;

    }

    closeCalendar() {
        this.showCalendar = false ;
    }

    toggleFilters() {
        this.showFilters = !this.showFilters;
    }

    clearFilters() {
        this.selectedCategories = [];
        this.selectedTags = [];
        this.eventTypes = [];
        this.toggleFilters();
    }

    dateClicked(ev) {
        this.dateSelected = ev;
        this.dateLoaded = ev;
        this.toggleCalendar();
        this.getResults(ev, true);
    }

    getResults(date: Date, refresh: boolean, iscroll?: boolean) {
        this.eventsStore.searchByDate(date, refresh)
            .subscribe(events => {
                if (iscroll && iscroll === true && events.length === 0) {
                    console.log('another day');
                    this.scrollAnotherDay();
                }

                if (events.length < 3 && this.events.length < 5) {
                    this.dateLoaded = moment(this.dateLoaded).add(1, 'day').toDate();
                    this.getResults(this.dateLoaded, false);
                }

                if (refresh) {
                    this.content.scrollToTop(1000);
                }
                this.populateFilters(events);
            }, error => {
                console.log(error);
            });
    }

    paramDate(date: Date) {
        return moment(date).format('YYYY-MM-DD');
    }

    populateFilters(data: Event[]) {
        data.forEach(event => {
            event.tags.forEach(tag => {
                this.tags.push(tag);
            });

            event.categories.forEach(cat => {
                this.categories.push(cat);
            });

            this.categories = _.uniqBy(this.categories, 'id');
            this.tags = _.uniqBy(this.tags, 'id');
        });
    }

    isPromoted(data: Event, date: Date) {
        return data.promotedListing &&
            moment(date).isBetween(moment(data.promotedFrom), moment(data.promotedTo));
    }

    scrollAnotherDay(ev?) {
        this.dateLoaded = moment(this.dateLoaded).add(1, 'day').toDate();
        this.getResults(this.dateLoaded, false, true);
        if (!ev) {
            this.scroll.complete();
        } else {
            ev.target.complete();
        }

    }


}
