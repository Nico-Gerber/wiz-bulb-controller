import { useState, useEffect } from 'react'

import {
    Button, Typography, Box,
    Divider, Modal, TextField, Grid
} from '@mui/material';

import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ClearIcon from '@mui/icons-material/Clear';

const MONO = { fontFamily: "monospace" };

export default function EditGroupModal({ open, close, selectedGroupName, setGroupName, handleUpdateGroup, selectedGroup, handleDelete, isKeyListening, setIsKeyListening, onKey, offKey, setMacro, clearMacro, onMacroId, offMacroId, macroError }) {



    const [dots, setDots] = useState("..");




    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev === ".." ? "..." : "..");
        }, 500);

        return () => clearInterval(interval);
    }, []);








    return (
        <Modal
            open={open}
            onClose={close}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >


            <Box sx={{
                display: "flex", flexDirection: 'column', gap: 2,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 500,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 24,
                borderRadius: 2,
                p: 4,
            }}>


                <Typography sx={{ fontFamily: MONO }}> Edit Group</Typography>

                {selectedGroup.id == 0 ? (<>


                    <Typography sx={{ fontFamily: MONO }}> Macros: Alt + Shift + </Typography>


                    <Grid sx={{ display: 'grid', gridTemplateColumns: '1fr 4fr 2fr 0.5fr', alignItems: 'center', gap: 2 }}>

                        <Typography sx={{ fontFamily: MONO }}> On  </Typography>

                        <TextField
                            value={isKeyListening == 'on' ? `Press any key${dots}` : onKey ? onKey : "unset"}
                            InputProps={{ readOnly: true }}

                        >    </TextField>

                        <Button color={isKeyListening === 'on' ? "error" : "primary"} variant='contained' onClick={() => { isKeyListening === 'on' ? setIsKeyListening(null) : setIsKeyListening('on') }} > <RadioButtonCheckedIcon></RadioButtonCheckedIcon></Button>


                        {onKey ? (
                            <Button onClick={() => clearMacro(onMacroId, "on")}>
                                <ClearIcon />
                            </Button>
                        ) : (<Box></Box>)}

                        <Typography sx={{ fontFamily: MONO }}> Off </Typography>

                        <TextField
                            value={isKeyListening == 'off' ? `Press any key${dots}` : offKey ? offKey : "unset"}
                            InputProps={{ readOnly: true }}

                        ></TextField>



                        <Button color={isKeyListening === 'off' ? "error" : "primary"} variant='contained' onClick={() => { isKeyListening === 'off' ? setIsKeyListening(null) : setIsKeyListening('off') }} > <RadioButtonCheckedIcon></RadioButtonCheckedIcon></Button>


                        {offKey && (
                            <Button onClick={() => clearMacro(offMacroId, "off")}>
                                <ClearIcon />
                            </Button>
                        )}




                    </Grid>

                    <Button variant="contained" onClick={async () => {




                        if (onKey) {
                            await setMacro('all', 'all', "on", onKey);
                        }
                        if (offKey) {
                            await setMacro('all', 'all', "off", offKey);
                        }



                        close();
                    }} >Update</Button>


                </>) :



                    (

                        <>

                            <TextField label='Name' value={selectedGroupName} onChange={(event) => { setGroupName(event.target.value); }} />

                            <Divider></Divider>

                            <Typography sx={{ fontFamily: MONO }}> Macros: Alt + Shift + </Typography>

                            <Grid sx={{ display: 'grid', gridTemplateColumns: '1fr 4fr 2fr 0.5fr', alignItems: 'center', gap: 2 }}>

                                <Typography sx={{ fontFamily: MONO }}> On  </Typography>

                                <TextField
                                    value={isKeyListening == 'on' ? `Press any key${dots}` : onKey ? onKey : "unset"}
                                    InputProps={{ readOnly: true }}

                                >    </TextField>

                                <Button color={isKeyListening === 'on' ? "error" : "primary"} variant='contained' onClick={() => { isKeyListening === 'on' ? setIsKeyListening(null) : setIsKeyListening('on') }} > <RadioButtonCheckedIcon></RadioButtonCheckedIcon></Button>


                                {onKey ? (
                                    <Button onClick={() => clearMacro(onMacroId, "on")}>
                                        <ClearIcon />
                                    </Button>
                                ) : (<Box></Box>)}

                                <Typography sx={{ fontFamily: MONO }}> Off </Typography>

                                <TextField
                                    value={isKeyListening == 'off' ? `Press any key${dots}` : offKey ? offKey : "unset"}
                                    InputProps={{ readOnly: true }}

                                ></TextField>



                                <Button color={isKeyListening === 'off' ? "error" : "primary"} variant='contained' onClick={() => { isKeyListening === 'off' ? setIsKeyListening(null) : setIsKeyListening('off') }} > <RadioButtonCheckedIcon></RadioButtonCheckedIcon></Button>


                                {offKey && (
                                    <Button onClick={() => clearMacro(offMacroId, "off")}>
                                        <ClearIcon />
                                    </Button>
                                )}




                            </Grid>

                            {selectedGroupName === '' ?

                                (<Button disabled>Name cannot be empty</Button>)

                                : (<Button variant="contained" onClick={async () => {
                                    handleUpdateGroup(selectedGroup.id, selectedGroupName);

                                    if (onKey) {
                                        await setMacro("group", selectedGroup.id, "on", onKey);
                                    }
                                    if (offKey) {
                                        await setMacro("group", selectedGroup.id, "off", offKey);
                                    }



                                    close();
                                }} >Update</Button>)}




                            <Button color='error' variant='contained' onClick={() => { handleDelete(selectedGroup.id); close() }}> Delete</Button>



                        </>
                    )}




                <Typography sx={{ font: MONO, color: 'red' }} >{macroError}</Typography>







            </Box>


        </Modal>
    )
}
