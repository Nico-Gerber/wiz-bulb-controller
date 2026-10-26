import React from 'react'

import {
    Button, Typography, Box, Modal, TextField
} from '@mui/material';

const MONO = { fontFamily: "monospace" };

export default function AddGroupModal({ open, handleClose, name, setName, addGroup }) {
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


                <Typography sx={{ fontFamily: MONO }}> Create New Group</Typography>

                <TextField label="Name" value={name} onChange={(event) => { setName(event.target.value); }} ></TextField>


                {name === '' ? (<Button variant='contained' disabled >Name cannot be empty</Button>) : (<Button variant='contained' onClick={() => { handleClose(); addGroup(); setName('') }} >Create</Button>)}



            </Box>


        </Modal>
    )
}
