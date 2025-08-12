import * as PropTypes from "prop-types";
import {Divider} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import {Icon} from '@mui/material';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export function TextDescription({text, value, title, FormatPrice, bottom_devider = true, globalFontSize, type}) {
	return (
		<>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				{title ? (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							padding: '12px',
							paddingLeft: 0,
						}}
					>
						<Typography
							fontWeight="bold"
							sx={{
								pr: 1.5,
								fontSize: `${globalFontSize}px !important`,
							}}
						>
							{text}
						</Typography>
						<Tooltip
							title={title}
							arrow
							placement="right"
						>
							<IconButton
								size="small"
								sx={{
									width: `${globalFontSize * 1.2}px`,
									height: `${globalFontSize * 1.2}px`,
									color: 'text.secondary',
									'&:hover': {
										color: 'text.primary',
									}
								}}
							>
								<InfoIcon fontSize="inherit"/>
							</IconButton>
						</Tooltip>
					</Box>
				) : (
					<Typography
						fontWeight="bold"
						sx={{
							p: '12px',
							pl: 0,
							pb: bottom_devider ? '12px' : 0,
							fontSize: `${globalFontSize}px !important`,
						}}
					>
						{text}
					</Typography>
				)}

				<Typography
					sx={{
						p: '12px',
						pl: 0,
						pr: 0,
						pb: bottom_devider ? '12px' : 0,
						fontSize: `${globalFontSize}px !important`,
					}}
				>
					{type === 'price' ? `${FormatPrice(value)} ₽` : value}
				</Typography>
			</Box>

			{bottom_devider && <Divider/>}
		</>
	)

}
