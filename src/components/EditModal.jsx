import { useState, useEffect } from 'react'

import {
    Button, Typography, Box, Select, MenuItem, InputLabel, FormControl,
    Modal, TextField, Grid
} from '@mui/material';

import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ClearIcon from '@mui/icons-material/Clear';

const MONO = { fontFamily: "monospace" };

export default function EditModal({ open, handleClose, name, setName, setPopUpText, handlePopup, handleDeleteLight, editingBulb, handleUpdateName, groups, selectedGroup, setSelectedGroup, handleUpdateGroup, onKey, offKey, isKeyListening, setIsKeyListening, clearMacro, onMacroId, offMacroId, macroError, setMacro }) {


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
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{
                display: "flex", flexDirection: 'column', gap: 2,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 24,
                borderRadius: 2,
                p: 4,
            }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ fontFamily: MONO }} >
                    Update Name
                </Typography>

                <TextField id="standard-basic" variant="outlined" value={name} onChange={(event) => { setName(event.target.value); }} />



                <FormControl variant="outlined" fullWidth>
                    <InputLabel id="group-label">Group</InputLabel>
                    <Select labelId="group-label" label="Group" value={selectedGroup} onChange={(event) => { setSelectedGroup(event.target.value); }}  >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {groups.map((group) => (<MenuItem key={group.id} value={group.id}>{group.name} </MenuItem>))}
                    </Select>
                </FormControl>



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












                {name === '' ? (<Button variant='disabled'>Name Cannot be empty</Button>) :

                    (<Button variant='contained' onClick={async () => {
                        handleClose();

                        handleUpdateName(editingBulb, name);

                        handleUpdateGroup(editingBulb.mac, selectedGroup)

                        if (onKey) {
                            await setMacro("bulb", editingBulb.mac, "on", onKey);
                        }
                        if (offKey) {
                            await setMacro("bulb", editingBulb.mac, "off", offKey);
                        }



                    }}> Update</Button>)}


                <Button variant='contained' color='error' onClick={() => { setPopUpText("Light Successfully Deleted"); handlePopup(); handleClose(); handleDeleteLight(editingBulb) }}   >Remove</Button>

                <Typography sx={{ font: MONO, color: 'red' }} >{macroError}</Typography>

            </Box>
        </Modal >
    )
}
