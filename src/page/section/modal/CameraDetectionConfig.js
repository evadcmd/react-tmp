import React, {useState, useEffect, useCallback} from 'react'

import MultiCrops from 'react-multi-crops'
import Dropzone from 'react-dropzone-uploader'

import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import http, {contextPath} from '../../../util/http' // for test

import 'react-dropzone-uploader/dist/styles.css'

const CAMERA_DETECTION_CONFIG_URL = `${contextPath}/api/camera-detection-config`
const UPLOAD_URL = `${CAMERA_DETECTION_CONFIG_URL}/photo-upload`

const STATE = {
    LOADING: 'LOADING',
    UPLOAD: 'UPLOAD',
    VIEW: 'VIEW'
}

function Loading() {
    return <div><Spinner animation='border' size='sm' />　ローディング</div>
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })
}

export default function CameraDetectionConfig({isManager, camera, saveCamera, setModal, imgWidth, ...props}) {

    const [state, setState] = useState(camera.id ? STATE.VIEW : STATE.UPLOAD)

    async function loadPhoto() {
        if (state === STATE.VIEW && !camera.img) {
            const {img, ignoreRects} = await http.get(CAMERA_DETECTION_CONFIG_URL, {id: camera.id})
            setModal({img, ignoreRects})
        }
    }

    // called every time a file's `status` changes
    const handleChangeStatus = ({meta, file}, status) => {
        console.log(status, meta, file)
        if (status === 'done') {
            setState(STATE.VIEW)
            /*
            toBase64(file).then(img => console.log(`img: ${img.slice(23)}`))
            setModal({img: null})
            */
            toBase64(file).then(img => setModal({img: img.slice(23)}))
        }
    }

    // receives array of files that are done uploading when submit button is clicked
    const handleSubmit = (files) => { console.log(files.map(f => f.meta)) }

    useEffect(() => {
        loadPhoto()
    }, [state, camera.img])
    
    switch (state) {
        case STATE.LOADING:
            return <Loading key='LOADING' />
        case STATE.UPLOAD:
            return <>
            {
                camera.img && <Button
                    variant='outline-dark'
                    onClick={() => setState(STATE.VIEW)}
                >
                    写真プレビュー
                </Button>
            }
                <Dropzone
                    getUploadParams={() => ({url: UPLOAD_URL, fields: {id: camera.id}})}
                    onChangeStatus={handleChangeStatus}
                    onSubmit={handleSubmit}
                    multiple={false}
                    maxFiles={1}
                    accept='image/*'
                />
            </>
        case STATE.VIEW:
            return camera.img ? <>
            {
                camera.img && <Button
                    variant='outline-dark'
                    onClick={() => setState(STATE.UPLOAD)}
                >
                    再アップロード
                </Button>
            }
                <MultiCrops
                    src={`data:image/jpeg;base64,${camera.img}`}
                    width={imgWidth.current}
                    coordinates={camera.ignoreRects || []}
                    onChange={(coord, i, ignoreRects) => setModal({ignoreRects})}
                    onDelete={(coord, i, ignoreRects) => setModal({ignoreRects})}
                    /*
                    onResize={(coord, i, ignoreRects) => {
                        const radio = imgWidth.current / imgWidth.prev 
                        setModal({
                            ignoreRects: ignoreRects.map(({x, y, width, height}) => ({
                                x: x * radio,
                                y: y * radio,
                                width: width * ratio,
                                height: height * radio
                            }))
                        })
                    }}
                    */
                />
            </> : <Loading key='LOADING' />
    }
}