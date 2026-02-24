import {ProjectEntity, ProjectGeneralInformationEntity} from "@/lib/db/schema/schema";
import {Project} from "@/lib/openapi/generated";
import {ProjectGeneralInformationMapper} from "@/lib/domain/project/projectGeneralInformation.mapper";

export class ProjectMapper {
  static toDto(entity: ProjectEntity & {
                 projectGeneralInformation: ProjectGeneralInformationEntity,
                 projectSpecificInformation: ProjectSpecificInformationEntity,
                 projectEnvironmentalImpact: ProjectEnvironmentalImpactEntity,
                 projectSocialImpact: ProjectSocialImpactEntity,
                 projectCompliance: ProjectComplianceEntity,
               }
  ): Project {
    return {
      id: entity.id,
      projectGeneralInformation: ProjectGeneralInformationMapper.toDto(entity.projectGeneralInformation),
      projectSpecificInformation: ProjectSpecificInformationMapper.toDto(entity.projectSpecificInformation),
      projectEnvironmentalImpact: ProjectEnvironmentalImpactMapper.toDto(entity.projectEnvironmentalImpact),
      projectSocialImpact: ProjectSocialImpactMapper.toDto(entity.projectSocialImpact),
      projectCompliance: ProjectComplianceMapper.toDto(entity.projectCompliance)
    };
  }

  static fromDto(dto: Project): ProjectEntity {
    return {
      id: Number(dto.id),
      projectGeneralInformationId: dto.projectGeneralInformation.id,
    };
  }
}