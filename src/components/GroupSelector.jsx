import React from "react";
import {
    Box,
    Typography,
    Paper,
    IconButton,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const MONO = { fontFamily: "monospace" };

export default function GroupSelector({
    selectedGroup,
    onGroupSelect,
    groups,
    addGroup
}) {
    const views = [{ name: "ALL", id: "0" }, ...groups];

    return (
        <Box
            sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                overflowX: "auto",
                overflowY: "hidden",
                pb: 1,

                "&::-webkit-scrollbar": {
                    height: 6,
                },

                "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255,255,255,.15)",
                    borderRadius: 999,
                },
            }}
        >
            {views.map((view) => {
                const isSelected = selectedGroup?.id === view.id;

                return (
                    <Paper
                        key={view.id}
                        onClick={() => onGroupSelect(view)}
                        elevation={0}
                        sx={{
                            flexShrink: 0,
                            px: 2.5,
                            py: 1.2,
                            borderRadius: 999,
                            cursor: "pointer",

                            border: isSelected
                                ? "1px solid #64B5F6"
                                : "1px solid rgba(255,255,255,.08)",

                            background: isSelected
                                ? "linear-gradient(135deg,#2196F3,#42A5F5)"
                                : "rgba(255,255,255,.04)",

                            boxShadow: isSelected
                                ? "0 0 20px rgba(33,150,243,.35)"
                                : "none",

                            transition: ".25s",

                            "&:hover": {
                                transform: "translateY(-2px)",
                                background: isSelected
                                    ? "linear-gradient(135deg,#1E88E5,#64B5F6)"
                                    : "rgba(255,255,255,.08)",
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                ...MONO,
                                whiteSpace: "nowrap",
                                fontWeight: 700,
                                fontSize: 15,
                                color: isSelected ? "#fff" : "#d9d9d9",
                            }}
                        >
                            {view.name}
                        </Typography>
                    </Paper>
                );
            })}

            <IconButton

                onClick={() => addGroup()}


                sx={{
                    flexShrink: 0,
                    ml: 1,
                    width: 42,
                    height: 42,
                    border: "1px dashed rgba(255,255,255,.25)",
                    color: "#64B5F6",
                    transition: ".25s",

                    "&:hover": {
                        background: "rgba(100,181,246,.15)",
                        borderColor: "#64B5F6",
                        transform: "rotate(90deg)",
                    },
                }}
            >
                <AddRoundedIcon />
            </IconButton>
        </Box>
    );
}