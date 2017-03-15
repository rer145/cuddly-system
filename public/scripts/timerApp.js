(function() {

    'use strict';

    //Firebase setup
    var config = {
        apiKey: "AIzaSyCIRIQzJo7UfNYIBkJNVZ9REzXhM4gmkOI",
        authDomain: "level-red-boxing-timer.firebaseapp.com",
        databaseURL: "https://level-red-boxing-timer.firebaseio.com",
        storageBucket: "level-red-boxing-timer.appspot.com",
        messagingSenderId: "252257792794"
    };
    firebase.initializeApp(config);


    var app = {
        isLoading: true,
        spinner: document.querySelector('.loader'),
        container: document.querySelector('.main'),
        db: new PouchDB('workouts')
    };

    app.init = function() {
        console.log("adapter: " + app.db.adapter);
        
        //read querystring
        //get workout
        //load data into divs

        app.db.get('2017-02-04T19:58:49.494Z', function(err, doc) {
            if (err) {
                console.log("can't find workout: " + err);
            } else {
                app.loadWorkout(doc);
            }
        });
    };

    app.loadWorkout = function(workout) {
        console.log(workout.key);
        var sequence = app.calculateWorkoutSequence(workout);
        var summary = app.calculateWorkoutSummary(workout);
        console.log(summary);
        console.log(sequence);
        if (workout.visible) {
            //primary panel
            app.container.querySelector('#section-name').textContent = sequence[0].section;
            app.container.querySelector('#exercise-name').textContent = sequence[0].exercise;
            app.container.querySelector('#set-current').textContent = "0";
            app.container.querySelector('#set-total').textContent = sequence[0].setTotal;
            
            //secondary panel
            app.container.querySelector('#next-exercise-name').textContent = sequence[1].exercise;
            app.container.querySelector('#next-exercise-time').textContent = sequence[1].exerciseTime;

            //summary panel
            app.container.querySelector("#elapsed-panel").textContent = "0:00";
            app.container.querySelector("#sets-current").textContent = "0";
            app.container.querySelector("#sets-total").textContent = summary.rounds;
            app.container.querySelector('#remaining-panel').textContent = summary.timeMinutes + ':00';
        }

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }        
    };

    app.getNextExercise = function(currentExercise, workout) {

    };

    app.startWorkout = function() {

    };

    app.pauseWorkout = function() {

    };

    app.stopWorkout = function() {
        //dialog box asking to view workouts or reset current
    };

    app.resetWorkout = function() {
        //app.loadWorkout();
    };

    app.viewAllWorkouts = function() {
        window.location.href = 'index.html';
    };

    app.calculateWorkoutSequence = function(workout) {
        var sequence = [];

        var sequenceCounter = 1;
        var intervalCounter = 1;
        var exerciseCounter = 1;

        if (workout.visible == true) {
            for (var i = 0; i < workout.sections.length; i++) {
                for (var j = 0; j < workout.sections[i].section.intervals.length; j++) {
                    var sets = workout.sections[i].section.intervals[j].interval.sets;
                    for (var k = 0; k < sets; k++) {
                        for (var m = 0; m < workout.sections[i].section.intervals[j].interval.exercises.length; m++) {
                            sequence.push({
                                workoutCurrent: sequenceCounter,

                                sectionCurrent: i+1,
                                sectionTotal: workout.sections.length,
                                section: workout.sections[i].section.name,

                                setCurrent: k+1,
                                setTotal: sets,

                                // intervalCurrent: j+1,
                                // intervalSetTotal: (sets * (workout.sections[i].section.intervals.length)),
                                
                                exeriseCurrent: m+1,
                                exercise: workout.sections[i].section.intervals[j].interval.exercises[m].exercise.name,
                                exerciseTime: workout.sections[i].section.intervals[j].interval.exercises[m].exercise.time,
                                exerciseTimePeriod: workout.sections[i].section.intervals[j].interval.exercises[m].exercise.period
                            });
                            sequenceCounter++;
                        }
                    }
                }
            }
        }

        return sequence;
    };

    // app.convertTimeToTimer = function(time, period) {
    //     //format:  mm:ss
    //     if (period == 'm') {
    //         return time*60;
    //     } else {
    //         return time;
    //     }
    // };

    app.calculateWorkoutSummary = function(data) {
        var output = {
            rounds: 0,
            timeMinutes: 0,
            timeSeconds: 0,
            sections: 0,
            visible: false
        };

        var workout = data;
        output.visible = (workout.visible == true);

        if (output.visible) {
            for (var i = 0; i < workout.sections.length; i++) {
                for (var j = 0; j < workout.sections[i].section.intervals.length; j++) {
                    var sectionRounds = workout.sections[i].section.intervals[j].interval.sets * workout.sections[i].section.intervals[j].interval.exercises.length;
                    output.rounds += sectionRounds;
                    
                    for (var k = 0; k < workout.sections[i].section.intervals[j].interval.exercises.length; k++) {
                        if (workout.sections[i].section.intervals[j].interval.exercises[k].exercise.period == 'm') {
                            output.timeSeconds += ((workout.sections[i].section.intervals[j].interval.exercises[k].exercise.time*60) * workout.sections[i].section.intervals[j].interval.sets);
                        } else {
                            output.timeSeconds += (workout.sections[i].section.intervals[j].interval.exercises[k].exercise.time * workout.sections[i].section.intervals[j].interval.sets);
                        }
                    }
                }
            }

            output.sections = workout.sections.length;
            output.timeMinutes = output.timeSeconds / 60.0;
        }

        return output;
    };

    app.init();

    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker
    //         .register('./service-worker.js')
    //         .then(function() {
    //             console.log('[ServiceWorker] Registered');
    //         });
    // }

})();