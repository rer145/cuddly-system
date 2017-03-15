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
        visibleWorkouts: {},
        spinner: document.querySelector('.loader'),
        workoutTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addWorkoutDialog: document.querySelector('.dialog-container'),
        db: new PouchDB('workouts')
    };

    app.init = function() {
        console.log("adapter: " + app.db.adapter);
        
        app.db.get('SAMPLE', function(err, doc) {
            if (err) {
                app.initWorkouts();
            }
        });

        app.db.allDocs({include_docs:true}, function(err, doc) {
            app.updateWorkoutCards(doc.rows);
        });
    };

    app.initWorkouts = function() {
        var sample = {
            _id: 'SAMPLE',
            visible: false
        };
        app.addWorkout(sample);

        var workout1 = {
            _id: 'workout-1',
            visible: true,
            key: 1,
            name: 'Sample Workout',
            created: '2016-02-04T01:00:00Z',
            sections: [
                {
                    section: {
                        name: 'Warmup',
                        intervals: [
                            {
                                interval: {
                                    sets: 5,
                                    exercises: [
                                        {
                                            exercise: {
                                                name: 'Jump Rope',
                                                time: 30,
                                                periodText: 'seconds',
                                                period: 's'
                                            }
                                        },
                                        {
                                            exercise: {
                                                name: 'Squats',
                                                time: 30,
                                                periodText: 'seconds',
                                                period: 's'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    section: {
                        name: 'Boxing',
                        intervals: [
                            {
                                interval: {
                                    sets: 4,
                                    exercises: [
                                        {
                                            exercise: {
                                                name: 'Heavy Bag',
                                                time: 1,
                                                periodText: 'minute',
                                                period: 'm'
                                            }
                                        },
                                        {
                                            exercise: {
                                                name: 'Jump Rope',
                                                time: 1,
                                                periodText: 'minute',
                                                period: 'm'
                                            }
                                        },
                                        {
                                            exercise: {
                                                name: 'Speed Bag',
                                                time: 1,
                                                periodText: 'minute',
                                                period: 'm'
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                interval: {
                                    sets: 4,
                                    exercises: [
                                        {
                                            exercise: {
                                                name: 'Speed Bag',
                                                time: 1,
                                                periodText: 'minute',
                                                period: 'm'
                                            }
                                        },
                                        {
                                            exercise: {
                                                name: 'Jump Rope',
                                                time: 1,
                                                periodText: 'minute',
                                                period: 'm'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    section: {
                        name: 'Cool Down',
                        intervals: [
                            {
                                interval: {
                                    sets: 5,
                                    exercises: [
                                        {
                                            exercise: {
                                                name: 'Jump Rope',
                                                time: 30,
                                                periodText: 'seconds',
                                                period: 's'
                                            }
                                        },
                                        {
                                            exercise: {
                                                name: 'Pushups',
                                                time: 30,
                                                periodText: 'seconds',
                                                period: 's'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        };
        // var workout2 = {

        // };

        app.addWorkout(workout1);
        //app.addWorkout(workout2);

        app.db.allDocs({include_docs:true}, function(err, doc) {
            app.updateWorkoutCards(doc.rows);
        });
    };

    // event listeners
    document.getElementById('btnAddWorkout').addEventListener('click', function() {
        app.toggleAddWorkoutDialog(true);
    });

    //model updates
    app.addWorkout = function(data) {
        app.db.put(data, function callback(err, results) {
            if (!err) {
                console.log('Workout has been saved.');
            } else {
                console.log('ERROR saving workout: ' + err);
            }
        });
    };
    
    //UI updates
    app.toggleAddWorkoutDialog = function(visible) {
        if (visible) {
            app.addWorkoutDialog.classList.add('dialog-container--visible');
        } else {
            app.addWorkoutDialog.classList.remove('dialog-container--visible');
        }
    };

    app.updateWorkoutCards = function(data) {
        data.forEach(function(workout)
        {
            //var workout = data[i].workout;

            var card = app.visibleWorkouts[workout.key];
            if (!card) {
                var summary = app.calculateWorkoutSummary(workout);
                if (summary.visible) {
                    card = app.workoutTemplate.cloneNode(true);
                    card.classList.remove('cardTemplate');
                    card.classList.add('clearfix');
                    
                    //set data in card
                    card.querySelector('.workout-key').textContent = workout.doc.key;
                    card.querySelector('.workout-name').textContent = workout.doc.name;
                    card.querySelector('.sections').textContent = "Sections: " + summary.sections;
                    card.querySelector('.total-rounds').textContent = "Rounds: " + summary.rounds;
                    card.querySelector('.total-time').textContent = "Time: " + summary.timeMinutes + " minutes";

                    card.querySelector('.info').addEventListener('click', function() {
                        window.location.href = 'timer.html?key=' + workout.doc.key;
                    });

                    card.removeAttribute('hidden');
                    app.container.appendChild(card);
                    app.visibleWorkouts[workout.key] = card;
                }
            }
        });

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }        
    };

    app.calculateWorkoutSummary = function(data) {
        var output = {
            rounds: 0,
            timeMinutes: 0,
            timeSeconds: 0,
            sections: 0,
            visible: false
        };

        var workout = data.doc;
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

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() {
                console.log('[ServiceWorker] Registered');
            });
    }

})();