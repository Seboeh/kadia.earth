import {
  CompanyEntity, GeocoordinatesEntity,
  MoneyAmountEntity,
  ProjectGeneralInformationEntity,
  ProjectRuntimeEntity
} from "@/lib/db/schema/schema";
import {
  Project,
  ProjectGeneralInformation,

} from "@/lib/openapi/generated";

export class ProjectGeneralInformationMapper {
  static toDto(entity: ProjectGeneralInformationEntity & Partial<{
    partnerCompany: CompanyEntity,
    financingAmount: MoneyAmountEntity,
    projectRuntime: ProjectRuntimeEntity,
    areaCoordinates: GeocoordinatesEntity
  }>): ProjectGeneralInformation {
    return {
      id: entity.id,
      title: entity.title ?? undefined,
      sponsor: entity.sponsor ?? undefined,
      partnerCompany: entity.partnerCompany ? CompanyMapper.toDto(entity.partnerCompany) : null,
      financingAmount: entity.financingAmount ? MoneyAmountMapper.toDto(entity.financingAmount) : null,
      projectRuntime: entity.projectRuntime ? ProjectRuntimeMapper.toDto(entity.projectRuntime) : null,
      projectLocation: entity.projectLocation ?? undefined,
      protectedArea: entity.protectedArea ?? undefined,
      areaCoordinates: entity.areaCoordinates ? GeocoordinatesMapper.toDto(entity.areaCoordinates) : null
    };
  }

  static fromDto(dto: Project): void {
    throw new Error("Not implemented yet.")
  }
}