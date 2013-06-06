/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
 var WalkControls = function ( camera, playerBody ) {

    var velocityFactor = 0.2;
    var scope = this;
	var RMB = false;

    var pitchObject = new THREE.Object3D();
    pitchObject.add( camera );

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 55;
    yawObject.add( pitchObject );

    var quat = new THREE.Quaternion();

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
	
	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();
	var movementX = 0;
	var movementY = 0;

	var projector = new THREE.Projector();
	var vector, raycaster, intersects, INTERSECTED, items = [];

    var velocity = playerBody.velocity;

    var PI_2 = Math.PI / 2;

	var onMouseDown = function ( event ) {

		event.preventDefault();
		if ( scope.enabled === false ) return;

		if ( event.button === 0 ) {

			if ( intersects.length > 0 ) {

				for ( var i = 0; i < items.length; i++ ) {

					if ( items[i].id == intersects[0].object.id ) {

						instructions.innerHTML = '<span style="font-size:50px">Box ' + (i+1) + '</span><br />(Click to Resume)';
						blocker.style.display = 'block';

						scope.enabled = false;
						break;

					}

				}

			}

		}

		else if ( event.button === 2 ) {

			RMB = true;
			rotateStart.set( event.clientX, event.clientY );

		}

	};

	var onMouseUp = function ( event ) {

		event.preventDefault();
		if ( scope.enabled === false ) return;

		RMB = false;

	};

    var onMouseMove = function ( event ) {

        event.preventDefault();
		if ( scope.enabled === false ) return;

        vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 1 );
		raycaster = projector.pickingRay( vector, camera );
		raycaster.far = 5; //picking distance from camera
		intersects = raycaster.intersectObjects( items );

		if ( intersects.length > 0 ) {

			if ( INTERSECTED != intersects[ 0 ].object ) {

				if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				INTERSECTED.material.emissive.setHex( 0xffff00 );

			}

			document.body.style.cursor = 'pointer';

		} else {

			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			INTERSECTED = null;

			document.body.style.cursor = 'auto';

		}

		if ( RMB == true ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			movementX -= ( PI_2 * rotateDelta.x / 2000);
			movementY -= ( PI_2 * rotateDelta.y / 2000);

			yawObject.rotation.y -= movementX;
			pitchObject.rotation.x -= movementY;

			pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

			rotateStart.copy( rotateEnd );

		}

	};

    var onKeyDown = function ( event ) {

        event.preventDefault();
		switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true; break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 27: // esc
			case 80: // p
				if ( scope.enabled === false ) {
					$("#pauseBlocker").css({
						"opacity": "0.7"
					});
					$("#pauseBlocker").show();
					$("#resume").show();
					$("#options").show();
					$("#quit").show();
					
				} else {	
					$("#pauseBlocker").hide();
					$("#resume").hide();
					$("#options").hide();
					$("#quit").hide();
					
				}
				
				scope.enabled = !scope.enabled; break;

		}

	
    };

    var onKeyUp = function ( event ) {

        switch( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // a
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    document.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'mousedown', onMouseDown, false );
	document.addEventListener( 'mouseup', onMouseUp, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

    this.enabled = false;

    this.getObject = function () {
        return yawObject;
    };
	
	this.addItem = function ( obj ) {
		items.push( obj );
	};

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    var inputVelocity = new THREE.Vector3();
    this.update = function ( delta ) {

        if ( scope.enabled === false ) return;

        delta *= 0.1;

        inputVelocity.set(0,0,0);

        if ( moveForward ){
            inputVelocity.z = -velocityFactor * delta;
        }
        if ( moveBackward ){
            inputVelocity.z = velocityFactor * delta;
        }

        if ( moveLeft ){
            inputVelocity.x = -velocityFactor * delta;
        }
        if ( moveRight ){
            inputVelocity.x = velocityFactor * delta;
        }

        // Convert velocity to world coordinates
        quat.setFromEuler({x:pitchObject.rotation.x, y:yawObject.rotation.y, z:0},"XYZ");
        quat.multiplyVector3(inputVelocity);

        // Add to the object
        velocity.x += inputVelocity.x;
        velocity.z += inputVelocity.z;

		playerBody.position.copy(yawObject.position);
		//playerBody.position.y = 5;

		movementX = 0;
		movementY = 0;

    };
};