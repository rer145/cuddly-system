(function() {

    'use strict';

    //firebase configuration
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

        //database: firebase.database(),

        spinner: document.querySelector('.loader'),
        body: document.querySelector('#body'),
        content: document.querySelector('.main'),

        timer: null,

        playSoundOnNextExercise: true,
        nextExerciseSound: 'media/boxing-bell.mp3',
        nextExerciseSoundId: 'next-exercise',

        playSoundOnNextExerciseWarning: false,
        nextExerciseWarningSecondsLeft: 10,
        nextExerciseWarningSound: 'media/boxing-clap.mp3',
        nextExerciseWarningSoundId: 'next-exercise-warning',

        workoutTemplate: document.querySelector('.workout-template'),
        workoutList: document.querySelector('#workout-list'),
        workoutForm: document.querySelector('#workout-form'),
        workoutTimer: document.querySelector('#workout-timer'),
        workoutPlaceholder: document.querySelector('#workout-edit-placeholder'),

        sectionTemplate: document.querySelector('.section-template'),
        intervalTemplate: document.querySelector('.interval-template'),
        exerciseTemplate: document.querySelector('.exercise-template'),

        navStartBtn: document.querySelector('#nav-start-workout'),
        navEndBtn: document.querySelector('#nav-end-workout'),
        //navAddBtn: document.querySelector('#nav-add-workout'),
        navRefreshBtn: document.querySelector('#nav-refresh-workout'),
        navListBtn: document.querySelector('#nav-list-workout'),

        dbWorkoutsRef: firebase.database().ref('workouts/')
    };

    app.init = function() {
        //hide timer nav buttons
        app.navStartBtn.setAttribute('hidden', true);
        app.navEndBtn.setAttribute('hidden', true);

        //firebase event listeners
        app.dbWorkoutsRef.on('child_added', function(data) {
            app.addWorkoutElement(data.key, data.val());
        });

        app.dbWorkoutsRef.on('child_changed', function(data) {
			app.updateWorkoutElement(data.key, data.val());
        });

        app.dbWorkoutsRef.on('child_removed', function(data) {
            app.removeWorkoutElement(data.key);
        });

        
        //ui event listeners
        // app.navAddBtn.addEventListener('click', function() {
        //     app.showWorkoutForm('');
        // });

        app.navRefreshBtn.addEventListener('click', function() {
			window.location.reload(true);
        });

        app.navListBtn.addEventListener('click', function() {
            try { clearInterval(app.timerInterval); } catch(x) { }
			app.showWorkoutList();
        });

        app.navStartBtn.addEventListener('click', function() {
            app.startWorkoutTimer();
        });

        app.navEndBtn.addEventListener('click', function() {
            app.endWorkoutTimer();
        });

        // document.getElementById('save-workout-form').addEventListener('click', function() {
        //     var workout = app.generateWorkoutJson();
		// 	if (app.workoutPlaceholder.getAttribute('workout-key') == '')
		// 		app.addWorkout(workout);
		// 	else
		// 		app.editWorkout(app.workoutPlaceholder.getAttribute('workout-key'), workout);
		// 	app.showWorkoutList();
        // });

        // document.getElementById('cancel-workout-form').addEventListener('click', function() {
        //     app.showWorkoutList();
        // });

        // document.getElementById('modal-delete-workout-btn').addEventListener('click', function() {
        //     app.removeWorkout();
        // });

        //load sounds if applicable
        if (app.playSoundOnNextExercise) {
            createjs.Sound.registerSound(app.nextExerciseSound, app.nextExerciseSoundId);
        }

        if (app.playSoundOnNextExerciseWarning) {
            createjs.Sound.registerSound(app.nextExerciseWarningSound, app.nextExerciseWarningSoundId);
        }

        //get data from firebase
        var workouts = firebase.database().ref('workouts/');
        workouts.on('value', function(snapshot) {
            if (snapshot.val() != null)
				app.showWorkoutList();
                //app.updateWorkoutList(snapshot.val());
            else
                app.preloadWorkoutList();
        });

        //show the content after loading
        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            //app.content.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    app.preloadWorkoutList = function() {
        var workout30 = "{\"name\":\"30 Minutes\",\"createdOn\":\"2017-02-13\",\"sections\":[{\"name\":\"Warmup\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Cardio\",\"time\":5},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Boxing\",\"intervals\":[{\"sets\":4,\"exercises\":[{\"name\":\"Boxing\",\"time\":3},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Cool Down\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Core\",\"time\":8}]}]}]}";
        
        var workout60 = "{\"name\":\"60 Minutes\",\"createdOn\":\"2017-02-13\",\"sections\":[{\"name\":\"Warmup\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Cardio\",\"time\":15},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Boxing\",\"intervals\":[{\"sets\":8,\"exercises\":[{\"name\":\"Boxing\",\"time\":3},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Cool Down\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Core\",\"time\":12}]}]}]}";

        var workout90 = "{\"name\":\"90 Minutes\",\"createdOn\":\"2017-02-13\",\"sections\":[{\"name\":\"Warmup\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Cardio\",\"time\":20},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Boxing\",\"intervals\":[{\"sets\":6,\"exercises\":[{\"name\":\"Boxing\",\"time\":3},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"HIIT\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"HIIT\",\"time\":10},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Boxing\",\"intervals\":[{\"sets\":6,\"exercises\":[{\"name\":\"Boxing\",\"time\":3},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Cool Down\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Core\",\"time\":10}]}]}]}";

		app.addWorkout(workout30);
        app.addWorkout(workout60);
        app.addWorkout(workout90);


        // var workoutTest = "{\"name\":\"Quick Test\",\"createdOn\":\"2017-02-13\",\"sections\":[{\"name\":\"Warmup\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Cardio\",\"time\":1},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Boxing\",\"intervals\":[{\"sets\":4,\"exercises\":[{\"name\":\"Boxing\",\"time\":1},{\"name\":\"Rest\",\"time\":1}]}]},{\"name\":\"Cool Down\",\"intervals\":[{\"sets\":1,\"exercises\":[{\"name\":\"Core\",\"time\":1}]}]}]}";
        // app.addWorkout(workoutTest);
    };

    

    

	/********** HELPER METHODS **********/
	app.calculateWorkoutSummary = function(workout) {
        var output = {
            rounds: 0,
            timeMinutes: 0,
            timeSeconds: 0,
            sections: 0
        };

        for (var i = 0; i < workout.sections.length; i++) {
            for (var j = 0; j < workout.sections[i].intervals.length; j++) {
                var sectionRounds = workout.sections[i].intervals[j].sets * workout.sections[i].intervals[j].exercises.length;
                output.rounds += sectionRounds;
                
                for (var k = 0; k < workout.sections[i].intervals[j].exercises.length; k++) {
                    output.timeSeconds += ((workout.sections[i].intervals[j].exercises[k].time * 60) * workout.sections[i].intervals[j].sets);
                }
            }
        }

        output.sections = workout.sections.length;
        output.timeMinutes = output.timeSeconds / 60.0;

        return output;
    };

    app.calculateWorkoutSequence = function(workout) {
        var sequence = [];

        var sequenceCounter = 1;
        var intervalCounter = 1;
        var exerciseCounter = 1;

		var timeCounter = 0;

        for (var i = 0; i < workout.sections.length; i++) {
            for (var j = 0; j < workout.sections[i].intervals.length; j++) {
                var sets = workout.sections[i].intervals[j].sets;
                for (var k = 0; k < sets; k++) {
                    for (var m = 0; m < workout.sections[i].intervals[j].exercises.length; m++) {
                        sequence.push({
                            workoutCurrent: sequenceCounter,

                            sectionCurrent: i+1,
                            sectionTotal: workout.sections.length,
                            section: workout.sections[i].name,

                            setCurrent: k+1,
                            setTotal: sets,

                            startTime: timeCounter,
							endTime: timeCounter + (Number(workout.sections[i].intervals[j].exercises[m].time) * 60) - 1,

                            // intervalCurrent: j+1,
                            // intervalSetTotal: (sets * (workout.sections[i].section.intervals.length)),
                            
                            exeriseCurrent: m+1,
                            exercise: workout.sections[i].intervals[j].exercises[m].name,
                            exerciseTime: (Number(workout.sections[i].intervals[j].exercises[m].time) * 60)
                        });
                        sequenceCounter++;
						timeCounter = timeCounter + (Number(workout.sections[i].intervals[j].exercises[m].time) * 60);
                    }
                }
            }
        }

        return sequence;
    };


	/********** DATABASE METHODS **********/
	app.addWorkout = function(workout) {
		var newWorkoutKey = firebase.database().ref().child('workouts').push().key;
        var updates = {};
        updates['/workouts/' + newWorkoutKey] = JSON.parse(workout);
        return firebase.database().ref().update(updates);
	};

	app.editWorkout = function(key, workout) {
		var updates = {};
        updates['/workouts/' + key] = JSON.parse(workout);
        return firebase.database().ref().update(updates);
	};
	
	app.removeWorkout = function(key) {
        firebase.database().ref('workouts/' + key).remove();
        //app.removeWorkoutElement(key);
    };

	/********** UI METHODS **********/
	app.removeWorkoutElement = function(key) {
        console.log('deleting ' + key);
        var card = app.workoutList.querySelector('.workout-card-' + key);
        app.workoutList.removeChild(card);
    };

    app.showWorkoutList = function() {
        app.endWorkoutTimer();

        app.body.classList.remove('timer');

        app.workoutList.removeAttribute('hidden');
        app.workoutForm.setAttribute('hidden', true);
        app.workoutTimer.setAttribute('hidden', true);

        app.navListBtn.setAttribute('hidden', true);
		//app.navAddBtn.removeAttribute('hidden');
        app.navRefreshBtn.removeAttribute('hidden');
        app.navStartBtn.setAttribute('hidden', true);
		app.navEndBtn.setAttribute('hidden', true);
    };

    app.showWorkoutForm = function(key) {
        app.endWorkoutTimer();

        app.workoutForm.removeAttribute('hidden');
        app.workoutList.setAttribute('hidden', true);
        app.workoutTimer.setAttribute('hidden', true);

		app.navListBtn.removeAttribute('hidden');
		//app.navAddBtn.setAttribute('hidden', true);
        app.navRefreshBtn.removeAttribute('hidden');
        app.navStartBtn.setAttribute('hidden', true);
		app.navEndBtn.setAttribute('hidden', true);

        if (key != "") {
            app.loadWorkoutFormEdit(key);
        } else {
            app.loadWorkoutForm();
        }
    };

    app.showWorkoutTimer = function(key) {
        app.body.classList.add('timer');
        app.workoutTimer.removeAttribute('hidden');
        app.workoutList.setAttribute('hidden', true);
        app.workoutForm.setAttribute('hidden', true);

        app.navListBtn.removeAttribute('hidden');
		//app.navAddBtn.setAttribute('hidden', true);
        app.navRefreshBtn.setAttribute('hidden', true);
        app.navStartBtn.removeAttribute('hidden');
		app.navEndBtn.setAttribute('hidden', true);

        app.loadWorkoutTimer(key);
    };

	/********** WORKOUT LIST UI METHODS **********/
	app.addWorkoutElement = function(key, data) {
        var card = app.workoutTemplate.cloneNode(true);
        card.classList.remove('workout-template');
        card.classList.add('workout-card-' + key);
        
        var summary = app.calculateWorkoutSummary(data);
        card.querySelector('.card-title').textContent = data.name;
        card.querySelector('.workout-key').textContent = key;
        card.querySelector('.sections').textContent = "Sections: " + summary.sections;
        card.querySelector('.total-rounds').textContent = "Rounds: " + summary.rounds;
        card.querySelector('.total-time').textContent = "Minutes: " + summary.timeMinutes;

        card.querySelector('.load-workout').setAttribute('key', key);
        card.querySelector('.load-workout').addEventListener('click', function() {
            app.showWorkoutTimer(key);
        });

        // card.querySelector('.edit-workout').setAttribute('key', key);
        // card.querySelector('.edit-workout').addEventListener('click', function() {
        //     app.showWorkoutForm(key);
        // });

        // card.querySelector('.delete-workout').setAttribute('key', key);
        // card.querySelector('.delete-workout').addEventListener('click', function() {
        //     var modal = document.getElementById('delete-workout-modal');
        //     modal.querySelector('#modal-workout-key').textContent = key;
        //     modal.querySelector('#modal-delete-workout-btn').removeAttribute('workout-key');
        //     modal.querySelector('#modal-delete-workout-btn').setAttribute('workout-key', key);
        //     //$('#delete-workout-modal').modal('open');

        //     app.removeWorkout(key);
        // });

        card.removeAttribute('hidden');
        app.workoutList.appendChild(card);
    };

	app.updateWorkoutElement = function(key, data) {
		var card = app.workoutList.querySelector('.workout-card-' + key);
		if (card != null) {
			var summary = app.calculateWorkoutSummary(data);
			card.querySelector('.card-title').textContent = data.name;
			card.querySelector('.workout-key').textContent = key;
			card.querySelector('.sections').textContent = "Sections: " + summary.sections;
			card.querySelector('.total-rounds').textContent = "Rounds: " + summary.rounds;
			card.querySelector('.total-time').textContent = "Minutes: " + summary.timeMinutes;

			card.querySelector('.load-workout').setAttribute('key', key);
			card.querySelector('.load-workout').addEventListener('click', function() {
				app.showWorkoutTimer(key);
			});

			// card.querySelector('.edit-workout').setAttribute('key', key);
			// card.querySelector('.edit-workout').addEventListener('click', function() {
			// 	app.showWorkoutForm(key);
			// });

			// card.querySelector('.delete-workout').setAttribute('key', key);
			// card.querySelector('.delete-workout').addEventListener('click', function() {
			// 	var modal = document.getElementById('delete-workout-modal');
			// 	modal.querySelector('#modal-workout-key').textContent = key;
			// 	modal.querySelector('#modal-delete-workout-btn').removeAttribute('workout-key');
			// 	modal.querySelector('#modal-delete-workout-btn').setAttribute('workout-key', key);
			// 	//$('#delete-workout-modal').modal('open');

			// 	app.removeWorkout(key);
			// });
		}
	};


	/********** WORKOUT FORM UI METHODS **********/

	app.generateWorkoutJson = function() {
		var workout = {};
		workout.sections = [];

		var placeholder = app.workoutPlaceholder;

		workout.name = placeholder.querySelector('#workout-name').value;
		workout.createdOn = new Date();

		var sectionCount = document.getElementsByClassName('.section-template').length;
		placeholder.querySelectorAll('.section-template').forEach(function(sectionElement) {
			var sIndex = sectionElement.getAttribute('section-key');
			var section = {};
			section.name = sectionElement.querySelector('#section-name-' + sIndex).value;
			section.intervals = [];
			sIndex++;

			var intervalCount = document.getElementsByClassName('.interval-template').length;
			sectionElement.querySelectorAll('.interval-template').forEach(function(intervalElement) {
				var iIndex = intervalElement.getAttribute('interval-key');
				var interval = {};
				interval.sets = intervalElement.querySelector('#interval-sets-' + iIndex).value;
				interval.exercises = [];
				iIndex++;

				var exerciseCount = document.getElementsByClassName('.exercise-template').length;
				intervalElement.querySelectorAll('.exercise-template').forEach(function(exerciseElement) {
					var eIndex = exerciseElement.getAttribute('exercise-key');
					var exercise = {};
					exercise.name = exerciseElement.querySelector('#exercise-name-' + eIndex).value;
					exercise.time = exerciseElement.querySelector('#exercise-time-' + eIndex).value;
					eIndex++;

					interval.exercises.push(exercise);
				});

				section.intervals.push(interval);
			});

			
			workout.sections.push(section);
		});

		return JSON.stringify(workout);
	};

    app.createSectionElement = function() {
        var count = 1;
		if (document.getElementById('workout-section-placeholder') != null) {
			//add one to last key in list to avoid duplicates
			var temp = document.getElementById('workout-section-placeholder').childNodes.length;
			var lastChild = document.getElementById('workout-section-placeholder').childNodes[temp-1];
			if (lastChild != null)
				count = Number(lastChild.getAttribute('section-key')) + 1;
			else
				count = 1;
		}
		
		var sectionTemplate = document.createElement('div');
        sectionTemplate.classList.add('card-panel');
        sectionTemplate.classList.add('section-template');
		sectionTemplate.setAttribute('section-key', count);

        var sectionNameRow = document.createElement('div');
        sectionNameRow.classList.add('row');
        var sectionNameCode = '<div class="input-field col s12">';
        sectionNameCode += '<input id="section-name-' + count + '" type="text" class="validate">';
        sectionNameCode += '<label for="section-name-' + count + '">Section Name<label>';
        sectionNameCode += '</div>';
        sectionNameRow.innerHTML = sectionNameCode;

        var sectionIntervalsRow = document.createElement('div');
        sectionIntervalsRow.classList.add('row');
        sectionIntervalsRow.innerHTML = '<div class="col s12"><div id="section-interval-placeholder"></div></div>';

        var sectionButtonRow = document.createElement('div');
        sectionButtonRow.classList.add('row');
        var sectionButtonCode = '<div class="col s6 left-align">';
        sectionButtonCode += '<a class="btn red lighten-1 btn-add-section"><i class="material-icons">add</i></a>';
        sectionButtonCode += '</div>';
        sectionButtonCode += '<div class="col s6 right-align">';
        sectionButtonCode += '<a class="btn red lighten-1 btn-delete-section"><i class="material-icons">delete</i></a>';
        sectionButtonCode += '</div>';
        sectionButtonRow.innerHTML = sectionButtonCode;

		sectionButtonRow.querySelector('.btn-add-section').addEventListener('click', function() {
			var section = app.createSectionElement();
        	var interval = app.createIntervalElement();
        	var exercise = app.createExerciseElement();
        	interval.querySelector('#interval-exercise-placeholder').appendChild(exercise);
        	section.querySelector('#section-interval-placeholder').appendChild(interval);
			app.workoutForm.querySelector('#workout-section-placeholder').appendChild(section);
		});
		sectionButtonRow.querySelector('.btn-delete-section').addEventListener('click', function() {
			app.workoutForm.querySelector('#workout-section-placeholder').removeChild(sectionTemplate);
		});

        sectionTemplate.appendChild(sectionNameRow);
        sectionTemplate.appendChild(sectionIntervalsRow);
        sectionTemplate.appendChild(sectionButtonRow);

        return sectionTemplate;
    };

    app.createIntervalElement = function() {
		var count = 1;
		if (document.getElementById('section-interval-placeholder') != null) {
			//add one to last key in list to avoid duplicates
			var temp = document.getElementById('section-interval-placeholder').childNodes.length;
			var lastChild = document.getElementById('section-interval-placeholder').childNodes[temp-1];
			if (lastChild != null)
				count = Number(lastChild.getAttribute('interval-key')) + 1;
			else
				count = 1;
		}

		var intervalTemplate = document.createElement('div');
        intervalTemplate.classList.add('card-panel');
        intervalTemplate.classList.add('interval-template');
		intervalTemplate.setAttribute('interval-key', count);

        var intervalNameRow = document.createElement('div');
        intervalNameRow.classList.add('row');
        var intervalNameCode = '<div class="col s8 input-field"><label>Interval</label></div>';
        intervalNameCode += '<div class="col s4 input-field"><input id="interval-sets-' + count + '" type="text" class="validate"><label for="interval-sets-' + count + '"># of Sets</label></div>';
        intervalNameRow.innerHTML = intervalNameCode;

        var intervalExercisesRow = document.createElement('div');
        intervalExercisesRow.classList.add('row');
        intervalExercisesRow.innerHTML = '<div class="col s12"><div id="interval-exercise-placeholder"></div></div>';

        var intervalButtonRow = document.createElement('div');
        intervalButtonRow.classList.add('row');
        var intervalButtonCode = '<div class="col s6 left-align">';
        intervalButtonCode += '<a class="btn red lighten-1 btn-add-interval"><i class="material-icons">add</i></a>';
        intervalButtonCode += '</div>';
        intervalButtonCode += '<div class="col s6 right-align">';
        intervalButtonCode += '<a class="btn red lighten-1 btn-delete-interval"><i class="material-icons">delete</i></a>';
        intervalButtonCode += '</div>';
        intervalButtonRow.innerHTML = intervalButtonCode;

		intervalButtonRow.querySelector('.btn-add-interval').addEventListener('click', function() {
			var interval = app.createIntervalElement();
			var exercise = app.createExerciseElement();
			interval.querySelector('#interval-exercise-placeholder').appendChild(exercise);
			app.workoutForm.querySelector('#section-interval-placeholder').appendChild(interval);
		});
		intervalButtonRow.querySelector('.btn-delete-interval').addEventListener('click', function() {
			app.workoutForm.querySelector('#section-interval-placeholder').removeChild(intervalTemplate);
		});

        intervalTemplate.appendChild(intervalNameRow);
        intervalTemplate.appendChild(intervalExercisesRow);
        intervalTemplate.appendChild(intervalButtonRow);

        return intervalTemplate;
    };

    app.createExerciseElement = function() {
        var count = 1;
		if (document.getElementById('interval-exercise-placeholder') != null) {
			//add one to last key in list to avoid duplicates
			var temp = document.getElementById('interval-exercise-placeholder').childNodes.length;
			var lastChild = document.getElementById('interval-exercise-placeholder').childNodes[temp-1];
			count = Number(lastChild.getAttribute('exercise-key')) + 1;
		}

		var exerciseTemplate = document.createElement('div');
        exerciseTemplate.classList.add('card-panel');
        exerciseTemplate.classList.add('exercise-template');
		exerciseTemplate.setAttribute('exercise-key', count);

        var exerciseNameRow = document.createElement('div');
        exerciseNameRow.classList.add('row');
        var exerciseNameCode = '<div class="input-field col s12">';
        exerciseNameCode += '<input id="exercise-name-' + count + '" type="text" class="validate">';
        exerciseNameCode += '<label for="exercise-name-' + count + '">Exercise Name</label>';
        exerciseNameCode += '</div>';
        exerciseNameRow.innerHTML = exerciseNameCode;

        var exerciseTimeRow = document.createElement('div');
        exerciseTimeRow.classList.add('row');
        var exerciseTimeCode = '<div class="input-field col s6">';
        exerciseTimeCode += '<input id="exercise-time-' + count + '" type="text" class="validate">';
        exerciseTimeCode += '<label for="exercise-time-' + count + '">Time</label>';
        exerciseTimeCode += '</div>';
        exerciseTimeCode += '<div class="input-field col s6">';
        exerciseTimeCode += '<select id="exercise-type-' + count + '" class="validate"><option value="s" selected>Seconds</option><option value="m">Minutes</option></select>';
        exerciseTimeCode += '<label for="exercise-type-' + count + '">Type</label>';
        exerciseTimeCode += '</div>';
        exerciseTimeRow.innerHTML = exerciseTimeCode;

        var exerciseButtonRow = document.createElement('div');
        exerciseButtonRow.classList.add('row');
        var exerciseButtonCode = '<div class="col s6 left-align">';
        exerciseButtonCode += '<a class="btn red lighten-1 btn-add-exercise"><i class="material-icons">add</i></a>';
        exerciseButtonCode += '</div>';
        exerciseButtonCode += '<div class="col s6 right-align">';
        exerciseButtonCode += '<a class="btn red lighten-1 btn-delete-exercise"><i class="material-icons">delete</i></a>';
        exerciseButtonCode += '</div>';
        exerciseButtonRow.innerHTML = exerciseButtonCode;

		exerciseButtonRow.querySelector('.btn-add-exercise').addEventListener('click', function() {
			var exercise = app.createExerciseElement();
			console.log(exercise.parent);
			app.workoutForm.querySelector('#interval-exercise-placeholder').appendChild(exercise);
		});
		exerciseButtonRow.querySelector('.btn-delete-exercise').addEventListener('click', function() {
			app.workoutForm.querySelector('#interval-exercise-placeholder').removeChild(exerciseTemplate);
		});

        exerciseTemplate.appendChild(exerciseNameRow);
        exerciseTemplate.appendChild(exerciseTimeRow);
        exerciseTemplate.appendChild(exerciseButtonRow);

        return exerciseTemplate;
    };

    app.clearWorkoutForm = function() {
        app.workoutForm.querySelector('#workout-name').value = "";
        Materialize.updateTextFields();
        
        var placeholder = document.getElementById("workout-section-placeholder");
        while (placeholder.hasChildNodes()) {
            placeholder.removeChild(placeholder.lastChild);
        }
    };

    app.loadWorkoutForm = function() {
        app.clearWorkoutForm();

		app.workoutPlaceholder.setAttribute('workout-key', '');
        var placeholder = document.getElementById("workout-section-placeholder");

        var section = app.createSectionElement();
        var interval = app.createIntervalElement();
        var exercise = app.createExerciseElement();

        interval.querySelector('#interval-exercise-placeholder').appendChild(exercise);
        section.querySelector('#section-interval-placeholder').appendChild(interval);
        placeholder.appendChild(section);
    };

    app.loadWorkoutFormEdit = function(key) {
        app.clearWorkoutForm();

        var ref = firebase.database().ref('workouts/' + key).once('value').then(function(snapshot) {
            var workout = snapshot.val();
            
            app.workoutPlaceholder.setAttribute('workout-key', key);
			app.workoutForm.querySelector('#workout-name').value = workout.name;

            var placeholder = document.getElementById("workout-section-placeholder");
            for (var i = 0; i < workout.sections.length; i++) {
                var section = app.createSectionElement();
				var sIndex = section.getAttribute('section-key');
                section.querySelector('#section-name-' + sIndex).value = workout.sections[i].name;

                for (var j = 0; j < workout.sections[i].intervals.length; j++) {
                    var interval = app.createIntervalElement();
					var iIndex = interval.getAttribute('interval-key');
                    interval.querySelector('#interval-sets-' + iIndex).value = workout.sections[i].intervals[j].sets;

                    for (var k = 0; k < workout.sections[i].intervals[j].exercises.length; k++) {
                        var exercise = app.createExerciseElement();
						var eIndex = exercise.getAttribute('exercise-key');
                        exercise.querySelector('#exercise-name-' + eIndex).value = workout.sections[i].intervals[j].exercises[k].name;
                        exercise.querySelector('#exercise-time-' + eIndex).value = workout.sections[i].intervals[j].exercises[k].time;
                        interval.querySelector('#interval-exercise-placeholder').appendChild(exercise);
                    }

                    section.querySelector('#section-interval-placeholder').appendChild(interval);
                }

                placeholder.appendChild(section);
            }

            Materialize.updateTextFields();
        });
    };



	/********** TIMER METHODS **********/

    app.loadWorkoutTimer = function(key) {
        var ref = firebase.database().ref('workouts/' + key).once('value').then(function(snapshot) {
            var workout = snapshot.val();
            var sequence = app.calculateWorkoutSequence(workout);
            var summary = app.calculateWorkoutSummary(workout);
            console.log(sequence);
            console.log(summary);

			app.workoutTimer.setAttribute('workout-key', key);

            app.workoutTimer.querySelector('#exercise-name').textContent = sequence[0].exercise;
            app.workoutTimer.querySelector('#exercise-time-remaining').textContent = "00:00:00";
            app.workoutTimer.querySelector('#next-exercise-name').textContent = 'Next Up: ' + sequence[1].exercise;
        });
    };

    app.startWorkoutTimer = function() {
		var key = app.workoutTimer.getAttribute('workout-key');
        var ref = firebase.database().ref('workouts/' + key).once('value').then(function(snapshot) {
            var workout = snapshot.val();
            var sequence = app.calculateWorkoutSequence(workout);
            var summary = app.calculateWorkoutSummary(workout);
		
			createjs.Sound.play(app.nextExerciseSoundId);
            app.startTimer(sequence, 0, sequence[0].exercise, sequence[1].exercise, sequence[0].exerciseTime, sequence[0].setCurrent, sequence[0].setTotal);
			
            app.navStartBtn.setAttribute('hidden', true);
			app.navEndBtn.removeAttribute('hidden');
		});
    };

    app.startTimer = function(sequence, currentSequence, exercise, nextExercise, time, currentSet, totalSets) {
        app.timer = new Timer();
        app.timer.start({countdown: true, startValues: {seconds: time}});

        var exerciseDisplay = exercise;
        if (totalSets > 1 && exercise != "Rest") {
            exerciseDisplay = exerciseDisplay + " (" + currentSet + " of " + totalSets + ")";
        }

        app.workoutTimer.querySelector('#exercise-name').textContent = exerciseDisplay;
        app.workoutTimer.querySelector('#exercise-time-remaining').textContent = app.timer.getTimeValues().toString();
        app.workoutTimer.querySelector('#next-exercise-name').textContent = 'Next Up: ' + nextExercise;
        
        app.timer.addEventListener('secondsUpdated', function(e) {
            if (app.timer.getTimeValues().seconds == app.nextExerciseWarningSecondsLeft) {
                if (app.playSoundOnNextExerciseWarning) {
                    createjs.Sound.play(app.nextExerciseWarningSoundId);
                }
            }
            app.workoutTimer.querySelector('#exercise-time-remaining').textContent = app.timer.getTimeValues().toString();
        });
        
        app.timer.addEventListener('targetAchieved', function(e) {
            currentSequence++;
            if (sequence[currentSequence] != null) {
                createjs.Sound.play(app.nextExerciseSoundId);
                if (sequence[currentSequence+1] != null) {
                    app.startTimer(sequence, currentSequence, sequence[currentSequence].exercise, sequence[currentSequence+1].exercise, sequence[currentSequence].exerciseTime, sequence[currentSequence].setCurrent, sequence[currentSequence].setTotal);
                } else {
                    app.startTimer(sequence, currentSequence, sequence[currentSequence].exercise, "", sequence[currentSequence].exerciseTime, sequence[currentSequence].setCurrent, sequence[currentSequence].setTotal);
                }
            } else {
                app.timer.stop();
                app.endWorkoutTimer();
            }
        });
    };

    app.endWorkoutTimer = function() {
        if (app.timer != null) {
            app.timer.stop();
        }
        app.navStartBtn.removeAttribute('hidden');
        app.navEndBtn.setAttribute('hidden', true);
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