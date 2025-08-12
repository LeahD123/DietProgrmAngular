import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DayOfWeekName, monthName } from './calendarPipe';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';
import { calendarService } from '../../services/calendar.service';
import { Calendar } from '../../classes/Calendar';


@Component({
    selector: 'calendar',
    imports: [CommonModule, monthName, DayOfWeekName],
    templateUrl: './calendar.html',
    styleUrls: ['./calendar.css'],
    encapsulation: ViewEncapsulation.None // הוסף כאן
})
export class calendar implements OnInit {
    @Input() month!: number;
    @Input() year!: number;
    @Input() day!: number;
    @Input() dayOfWeek!: number;
    theDay: Date = new Date();
    endMonth : Date = new Date(this.theDay.getFullYear(), this.theDay.getMonth() + 1, 0);
    numOfDays: number = this.endMonth.getDate();
    itemsList: Calendar[] = new Array(this.numOfDays).fill(null); // הגדרת רשימה לאחסון הנתונים
    myForm: FormGroup = new FormGroup({}); // הוסף את ה-FormGroup
    constructor(private sanitizer: DomSanitizer ,public calendarService: calendarService) {} // הוסף את DomSanitizer לקונסטרקטור
    ngOnInit(): void {
        this.restartFrom();
        this.calendarHtml = this.sanitizer.bypassSecurityTrustHtml(this.generateCalendar()); // עדכן את המשתנה עם התוצאה
        console.log(this.calendarHtml.toString()); // הוסף כאן לוג לבדוק את התוצאה
    }
restartFrom() {
    console.log("restartFrom called");
    this.myForm = new FormGroup({
        month: new FormControl(new Date().getMonth()),
        year: new FormControl(new Date().getFullYear()),
        day: new FormControl(new Date().getDate()),
        dayOfWeek: new FormControl(new Date().getDay()),
        items: new FormControl(this.itemsList) // הוסף את itemsList כערך לשדה items

    });

 this.calendarService.getcalendarItems().subscribe(
    (items: Array<Calendar>) => {
        this.itemsList = []; // אתחול המערך
        console.log("Fetched calendar items:", items);
        
        const userId = Number(localStorage.getItem("userId")); // קבלת מזהה המשתמש
        for (let i = 0; i < items.length; i++) {
            // הוספת אובייקט אם ה-userId תואם
            if (items[i].userId === userId) {
                this.itemsList[i] = items[i]; // הוספת האובייקט במיקום המתאים
            }
        }
        
        console.log("Filtered itemsList for userId:", this.itemsList);
        this.myForm.patchValue({ items: this.itemsList }); // עדכון הערך של items ב-FormGroup
    },
    (error) => {
        console.error('Error fetching calendar items:', error);
    }
);




    console.log("this is itemsList:", this.itemsList);
}
    generateCalendar() {
        console.log("generateCalendar called");
    const thisDay = new Date();
    let calendarHtml = `<section class="calendar__top-bar">
      <span class="top-bar__days">Mon</span>
      <span class="top-bar__days">Tue</span>
      <span class="top-bar__days">Wed</span>
      <span class="top-bar__days">Thu</span>
      <span class="top-bar__days">Fri</span>
      <span class="top-bar__days">Sat</span>
      <span class="top-bar__days">Sun</span>
    </section><section class="calendar__week">`;
    
    let isWeek: number = 0;
    const firstDayOfMonth = new Date(thisDay.getFullYear(), thisDay.getMonth(), 1);
    const lastDayOfMonth = new Date(thisDay.getFullYear(), thisDay.getMonth() + 1, 0);
    const daysInCurrentMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysFromPreviousMonth = firstDayOfWeek - 1;
    const previousMonthDays = new Date(thisDay.getFullYear(), thisDay.getMonth(), 0).getDate();
    const firstDayAtCalendar = previousMonthDays - daysFromPreviousMonth;
    const totalDaysInCalendar = 35;
    const daysNeededAfter = totalDaysInCalendar - (daysInCurrentMonth + daysFromPreviousMonth);

    // מילוי הימים מהחודש הקודם
    for (let days = 0; days < daysFromPreviousMonth; days++) {
        if (isWeek == 7) {
            calendarHtml += `</section><section class="calendar__week">`;
            isWeek = 0;
        }
        calendarHtml += `<div class="calendar__day inactive">
                            <span class="calendar__date">${firstDayAtCalendar + days}</span>
                        </div>`;
        isWeek += 1;
    }

    // מילוי הימים מהחודש הנוכחי
    for (let days = 0; days < daysInCurrentMonth; days++) {

const successItem = this.itemsList.map(item => {
    // כאן תוכל להוסיף את הלוגיקה שלך לקביעת הערך
    if (item) {
        // לדוגמה: אם יש מאפיין מסוים שאתה בודק
        return item.success ? true : false; // מחזיר true אם התנאי מתקיים, אחרת false
    }
    return null; // מחזיר null אם הפריט הוא null
});
        let className = '';

    try {
        if (successItem) {
className = successItem[days] === true ? 'success' : 
            (successItem[days] === false ? 'failure' : '');
                        console.log("sucsses response:", className);
        } else {
            console.log("successItem not found for date:", new Date(thisDay.getFullYear(), thisDay.getMonth(), days + 1));
            className = 'failure'; // ברירת מחדל במקרה של לא נמצא successItem
        }
    } catch (error) {
        console.error("Error processing successItem:", error);
        className = 'failure'; // ברירת מחדל במקרה של שגיאה
    }


        if (isWeek == 7) {
            calendarHtml += `</section><section class="calendar__week">`;
            isWeek = 0;
        }

        if (days + 1 == thisDay.getDate()) {
            calendarHtml += `<div class="calendar__day today ${className}">
                                <span class="calendar__date">${days + 1}</span>
                            </div>`;
        } else {
            calendarHtml += `<div class="calendar__day ${className}">
                                <span class="calendar__date">${days + 1}</span>
                            </div>`;
        }
        isWeek += 1;
    }

    // מילוי הימים מהחודש הבא
    for (let days = 0; days < daysNeededAfter; days++) {
        if (isWeek == 7) {
            calendarHtml += `</section><section class="calendar__week">`;
            isWeek = 0;
        }
        calendarHtml += `<div class="calendar__day inactive">
                            <span class="calendar__date">${days + 1}</span>
                        </div>`;
        isWeek += 1;
    }

    return calendarHtml;
}
        calendarHtml: SafeHtml = "";
}
