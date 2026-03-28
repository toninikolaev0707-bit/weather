import OBR, { Item, Vector2 } from "@owlbear-rodeo/sdk";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { getMetadata } from "../util/getMetadata";
import { WeatherConfig } from "../types/WeatherConfig";
import { getPluginId } from "../util/getPluginId";
import { isPlainObject } from "./util/isPlainObject";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import FormLabel from "@mui/material/FormLabel";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import { WindLow } from "./icons/WindLow";
import { WindMedium } from "./icons/WindMedium";
import { WindHigh } from "./icons/WindHigh";
import { WindMax } from "./icons/WindMax";
import { DensityLow } from "./icons/DensityLow";
import { DensityMedium } from "./icons/DensityMedium";
import { DensityHigh } from "./icons/DensityHigh";
import { DensityMax } from "./icons/DensityMax";
import Skeleton from "@mui/material/Skeleton";
import North from "@mui/icons-material/NorthRounded";
import East from "@mui/icons-material/EastRounded";
import South from "@mui/icons-material/SouthRounded";
import West from "@mui/icons-material/WestRounded";
import NorthEast from "@mui/icons-material/NorthEastRounded";
import SouthEast from "@mui/icons-material/SouthEastRounded";
import SouthWest from "@mui/icons-material/SouthWestRounded";
import NorthWest from "@mui/icons-material/NorthWestRounded";
import Button from "@mui/material/Button";
import Paper, { PaperProps } from "@mui/material/Paper";
import Box from "@mui/material/Box";

const SmallLabel = styled(FormLabel)({
  fontSize: "0.75rem",
  marginBottom: 4,
});

const ScrollInsetPaper = forwardRef<HTMLDivElement, PaperProps>(
  ({ children, ...rest }, ref) => {
    return (
      <Paper
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          maxWidth: "calc(100% - 32px)",
          maxHeight: "calc(100% - 96px)",
          boxShadow: "var(--Paper-shadow)",
          backgroundImage: "var(--Paper-overlay)",
          position: "absolute",
          display: "flex",
          py: 1,
        }}
        {...rest}
        ref={ref}
      >
        <Box
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            outline: 0,
            WebkitOverflowScrolling: "touch",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Paper>
    );
  }
);

export function Menu() {
  const [selection, setSelection] = useState<string[] | null>(null);
  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const selection = await OBR.player.getSelection();
      if (mounted) {
        setSelection(selection ?? null);
      }
    };
    initialize();
    return () => {
      mounted = false;
    };
  }, []);

  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    if (!selection) {
      return;
    }

    let mounted = true;
    const getItems = async () => {
      const items = await OBR.scene.items.getItems(selection);
      if (mounted) {
        setItems(items);
      }
    };
    getItems();

    const unsubscribe = OBR.scene.items.onChange((items) => {
      if (mounted) {
        setItems(items.filter((item) => selection.includes(item.id)));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [selection]);

  if (items) {
    return <MenuControls items={items} />;
  } else {
    return <MenuSkeleton />;
  }
}

type Direction =
  | "EAST"
  | "SOUTH"
  | "WEST"
  | "NORTH"
  | "NORTH_EAST"
  | "SOUTH_EAST"
  | "SOUTH_WEST"
  | "NORTH_WEST";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function toDegrees(angle: number): number {
  return angle * (180 / Math.PI);
}

function roundTo(x: number, to: number): number {
  return Math.round(x / to) * to;
}

function vectorToDirection(vec: Vector2): Direction {
  const angle = Math.atan2(vec.y, vec.x);
  const degrees = mod(toDegrees(angle), 360);
  const rounded = roundTo(degrees, 45);
  if (rounded === 0) {
    return "EAST";
  } else if (rounded === 90) {
    return "NORTH";
  } else if (rounded === 180) {
    return "WEST";
  } else if (rounded === 270) {
    return "SOUTH";
  } else if (rounded === 45) {
    return "NORTH_EAST";
  } else if (rounded === 135) {
    return "NORTH_WEST";
  } else if (rounded === 225) {
    return "SOUTH_WEST";
  } else {
    return "SOUTH_EAST";
  }
}

function directionToVector(dir: Direction): Vector2 {
  switch (dir) {
    case "EAST":
      return { x: 1, y: 0 };
    case "NORTH":
      return { x: 0, y: 1 };
    case "SOUTH":
      return { x: 0, y: -1 };
    case "WEST":
      return { x: -1, y: 0 };
    case "NORTH_EAST":
      return { x: 1, y: 1 };
    case "NORTH_WEST":
      return { x: -1, y: 1 };
    case "SOUTH_EAST":
      return { x: 1, y: -1 };
    case "SOUTH_WEST":
      return { x: -1, y: -1 };
  }
}

function directionToLabel(dir: Direction): React.ReactNode {
  switch (dir) {
    case "EAST":
      return (
        <>
          E <East fontSize="small" />
        </>
      );
    case "NORTH":
      return (
        <>
          N <North fontSize="small" />
        </>
      );
    case "SOUTH":
      return (
        <>
          S <South fontSize="small" />
        </>
      );
    case "WEST":
      return (
        <>
          W <West fontSize="small" />
        </>
      );
    case "NORTH_EAST":
      return (
        <>
          NE <NorthEast fontSize="small" />
        </>
      );
    case "NORTH_WEST":
      return (
        <>
          NW <NorthWest fontSize="small" />
        </>
      );
    case "SOUTH_EAST":
      return (
        <>
          SE <SouthEast fontSize="small" />
        </>
      );
    case "SOUTH_WEST":
      return (
        <>
          SW <SouthWest fontSize="small" />
        </>
      );
  }
}

function MenuControls({ items }: { items: Item[] }) {
  const config = useMemo<WeatherConfig>(() => {
    for (const item of items) {
      const config = getMetadata<WeatherConfig>(
        item.metadata,
        getPluginId("weather"),
        { type: "SNOW" }
      );
      return config;
    }
    return { type: "SNOW" };
  }, [items]);

  const values: Required<WeatherConfig> = {
    density: config.density ?? 3,
    direction: config.direction ?? { x: -1, y: -1 },
    speed: config.speed ?? 1,
    type: config.type,
  };

  async function handleConditionChange(value: WeatherConfig["type"]) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.type = value;
        }
      }
    });
  }

  const directionValue = vectorToDirection(values.direction);
  async function handleDirectionChange(value: Direction) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.direction = directionToVector(value);
        }
      }
    });
  }

  async function handleCoverChange(value: number) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.density = value;
        }
      }
    });
  }

  async function handleWindChange(value: number) {
    await OBR.scene.items.updateItems(items, (items) => {
      for (const item of items) {
        const config = item.metadata[getPluginId("weather")];
        if (isPlainObject(config)) {
          config.speed = value;
        }
      }
    });
  }

  return (
    <Stack px={2} py={1}>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControl fullWidth>
          <SmallLabel id="condition-label">Condition</SmallLabel>
          <Select
            labelId="condition-label"
            value={values.type}
            size="small"
            onChange={(e) =>
              handleConditionChange(e.target.value as WeatherConfig["type"])
            }
            MenuProps={{
              slots: {
                paper: ScrollInsetPaper,
              },
            }}
          >
            <MenuItem value="SNOW">Snow</MenuItem>
            <MenuItem value="RAIN">Rain</MenuItem>
            <MenuItem value="SAND">Sand</MenuItem>
            <MenuItem value="FIRE">Fire</MenuItem>
            <MenuItem value="CLOUD">Cloud</MenuItem>
            <MenuItem value="BLOOM">Bloom</MenuItem>
            <MenuItem value="AURALINES">Aura swag line</MenuItem>
            <MenuItem value="BLIZZARD">Blizzard</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <SmallLabel id="direction-label">Direction</SmallLabel>
          <Select
            labelId="direction-label"
            value={directionValue}
            size="small"
            onChange={(e) => handleDirectionChange(e.target.value as Direction)}
            renderValue={directionToLabel}
            sx={{
              ".MuiSelect-select": {
                display: "flex",
                alignItems: "center",
              },
              ".MuiSvgIcon-root": {
                ml: 0.5,
              },
            }}
            MenuProps={{
              slots: {
                paper: ScrollInsetPaper,
              },
            }}
          >
            <MenuItem value="NORTH">
              North <North sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="NORTH_EAST">
              North East <NorthEast sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="EAST">
              East <East sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="SOUTH_EAST">
              South East <SouthEast sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="SOUTH">
              South <South sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="SOUTH_WEST">
              South West
              <SouthWest sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="WEST">
              West <West sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
            <MenuItem value="NORTH_WEST">
              North West <NorthWest sx={{ ml: 0.5 }} fontSize="small" />
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControl fullWidth>
          <SmallLabel>Wind</SmallLabel>
          <ToggleButtonGroup
            exclusive
            aria-label="edge"
            size="small"
            value={values.speed}
            onChange={(_, v) => v && handleWindChange(v)}
            fullWidth
          >
            <ToggleButton value={1} aria-label="low">
              <WindLow />
            </ToggleButton>
            <ToggleButton value={2} aria-label="medium">
              <WindMedium />
            </ToggleButton>
            <ToggleButton value={3} aria-label="high">
              <WindHigh />
            </ToggleButton>
            <ToggleButton value={4} aria-label="max">
              <WindMax />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 2 }} alignItems="center">
        <FormControl fullWidth>
          <SmallLabel>Cover</SmallLabel>
          <ToggleButtonGroup
            exclusive
            aria-label="type"
            size="small"
            value={values.density}
            onChange={(_, v) => v && handleCoverChange(v)}
            fullWidth
          >
            <ToggleButton value={1} aria-label="low">
              <DensityLow />
            </ToggleButton>
            <ToggleButton value={2} aria-label="medium">
              <DensityMedium />
            </ToggleButton>
            <ToggleButton value={3} aria-label="high">
              <DensityHigh />
            </ToggleButton>
            <ToggleButton value={4} aria-label="max">
              <DensityMax />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
      <Button
        size="small"
        fullWidth
        onClick={async () => {
          const selection = await OBR.player.getSelection();
          if (!selection || selection.length === 0) {
            return;
          }
          await OBR.scene.items.updateItems(selection, (items) => {
            for (const item of items) {
              delete item.metadata[getPluginId("weather")];
            }
          });
        }}
        color="error"
      >
        Remove Weather
      </Button>
    </Stack>
  );
}

function FormControlSkeleton() {
  return (
    <Stack width="100%" gap={0.5}>
      <Skeleton height={17.25} width={40} />
      <Skeleton
        variant="rectangular"
        height={40}
        width="100%"
        sx={{ borderRadius: 0.5 }}
      />
    </Stack>
  );
}

function MenuSkeleton() {
  return (
    <Stack px={2} py={1}>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControlSkeleton />
        <FormControlSkeleton />
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 1 }} alignItems="center">
        <FormControlSkeleton />
      </Stack>
      <Stack gap={1} direction="row" sx={{ mb: 2 }} alignItems="center">
        <FormControlSkeleton />
      </Stack>
      <Skeleton
        variant="rectangular"
        height={30.75}
        width="100%"
        sx={{ borderRadius: "20px" }}
      />
    </Stack>
  );
}
